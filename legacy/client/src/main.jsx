import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ethers } from "ethers";
import "./styles.css";

const SESSION_KEY = "energychain.react.session";
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const CONTRACT_ABI = [
  "function createOffer(bytes32 userHash, uint256 price)",
  "function getOfferCount() view returns (uint256)",
  "function getOffer(uint256 id) view returns (bytes32,uint256,uint256,bool)",
  "function getOwnerAddress(uint256 id) view returns (address)",
  "function cancelOffer(uint256 id)",
  "function acceptOffer(uint256 id) payable",
];

const shortAddress = (value) => value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Not connected";
const hashName = (name) => ethers.keccak256(ethers.toUtf8Bytes(name.trim().toLowerCase()));

function sessionFromStorage() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function storeSession(session) {
  sessionStorage.clear();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Temporary compatibility for the remaining legacy feature modules. The
  // backend still authorizes every protected request from the JWT user ID.
  sessionStorage.setItem("userName", session.user.name);
  sessionStorage.setItem("userEmail", session.user.email);
  sessionStorage.setItem("isLoggedIn", "true");
  sessionStorage.setItem("authToken", session.token);
}

async function request(path, token, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.msg || body.error || "Request failed.");
  return body;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const body = mode === "login" ? { email: email.trim().toLowerCase(), password } : { name: name.trim(), email: email.trim().toLowerCase(), password };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.token) throw new Error(result.msg || "Authentication failed.");
      const session = { token: result.token, user: result.user };
      storeSession(session);
      onAuthenticated(session);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  }

  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Energy marketplace</p><h1>EnergyChain</h1><p className="muted">{mode === "login" ? "Sign in to your isolated marketplace account." : "Create a secure marketplace account."}</p>
    <form onSubmit={submit}>
      {mode === "signup" && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>}
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p className="error">{error}</p>}
      <button disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
    </form>
    <button className="link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>{mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}</button>
  </section></main>;
}

function Dashboard({ session, onLogout }) {
  const [wallet, setWallet] = useState(null);
  const [contract, setContract] = useState(null);
  const [offers, setOffers] = useState([]);
  const [price, setPrice] = useState("0.01");
  const [status, setStatus] = useState("Connect your permanently bound MetaMask wallet to trade.");
  const [error, setError] = useState("");
  const providerRef = useRef(null);
  const addressRef = useRef(null);
  const contractAddressRef = useRef(null);

  const loadOffers = useCallback(async (activeContract) => {
    if (!activeContract) return;
    const count = Number(await activeContract.getOfferCount());
    const values = await Promise.all(Array.from({ length: count }, async (_, id) => {
      const [raw, seller] = await Promise.all([activeContract.getOffer(id), activeContract.getOwnerAddress(id)]);
      return { id, seller, userHash: raw[0], priceEth: ethers.formatEther(raw[1]), active: raw[3], created: new Date(Number(raw[2]) * 1000).toLocaleString() };
    }));
    setOffers(values.filter((offer) => offer.active));
  }, []);

  const activeSignerContract = useCallback(async () => {
    const provider = providerRef.current;
    const expectedWallet = wallet?.toLowerCase();
    if (!provider || !expectedWallet || !contractAddressRef.current) throw new Error("Connect your bound wallet first.");
    const accounts = await provider.send("eth_accounts", []);
    const current = accounts[0] && ethers.getAddress(accounts[0]);
    if (!current || current.toLowerCase() !== expectedWallet) throw new Error("MetaMask selected a wallet that is not bound to this EnergyChain user.");
    const binding = await request("/auth/wallet", session.token);
    if (!binding.walletAddress || binding.walletAddress.toLowerCase() !== expectedWallet) throw new Error("Your permanent wallet binding could not be verified.");
    return new ethers.Contract(contractAddressRef.current, CONTRACT_ABI, await provider.getSigner(current));
  }, [session.token, wallet]);

  const connectWallet = useCallback(async () => {
    setError("");
    try {
      if (!window.ethereum) throw new Error("Install or unlock MetaMask first.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
      }
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) throw new Error("MetaMask did not provide an account.");
      const selectedWallet = ethers.getAddress(accounts[0]);
      const binding = await request("/auth/wallet", session.token);
      if (binding.walletAddress && binding.walletAddress.toLowerCase() !== selectedWallet.toLowerCase()) {
        throw new Error(`This user is permanently bound to ${shortAddress(binding.walletAddress)}. Switch MetaMask to that wallet.`);
      }
      if (!binding.walletAddress) await request("/auth/wallet", session.token, { method: "POST", body: JSON.stringify({ walletAddress: selectedWallet }) });
      const configResponse = await fetch("/config/contract_address.json");
      const config = await configResponse.json();
      const address = config[11155111];
      if (!ethers.isAddress(address) || await provider.getCode(address) === "0x") throw new Error("The configured Sepolia EnergyOffer contract is unavailable.");
      const signer = await provider.getSigner(selectedWallet);
      const signerContract = new ethers.Contract(address, CONTRACT_ABI, signer);
      providerRef.current = provider;
      contractAddressRef.current = address;
      addressRef.current = selectedWallet;
      setWallet(selectedWallet);
      setContract(signerContract);
      await loadOffers(signerContract);
      setStatus(`Wallet ${shortAddress(selectedWallet)} is permanently bound to ${session.user.name}.`);
    } catch (failure) {
      setError(failure.message);
    }
  }, [loadOffers, session.token, session.user.name]);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const accountChanged = (accounts) => {
      const selected = accounts[0] && ethers.getAddress(accounts[0]);
      if (!selected || selected.toLowerCase() !== addressRef.current?.toLowerCase()) {
        setContract(null); setWallet(null); addressRef.current = null;
        setStatus("MetaMask account changed. Switch back to your permanently bound wallet to trade.");
      }
    };
    window.ethereum.on("accountsChanged", accountChanged);
    return () => window.ethereum.removeListener("accountsChanged", accountChanged);
  }, []);

  async function createOffer(event) {
    event.preventDefault(); setError("");
    try {
      const active = await activeSignerContract();
      const amount = ethers.parseEther(price);
      if (amount < ethers.parseEther("0.01")) throw new Error("Minimum offer price is 0.01 ETH.");
      setStatus("Confirm offer creation in MetaMask…");
      const tx = await active.createOffer(hashName(session.user.name), amount);
      await tx.wait(); await loadOffers(active); setStatus(`Offer created: ${tx.hash}`);
    } catch (failure) { setError(failure.message); }
  }

  async function cancelOffer(id) {
    setError("");
    try { const active = await activeSignerContract(); const tx = await active.cancelOffer(id); await tx.wait(); await loadOffers(active); setStatus(`Offer cancelled: ${tx.hash}`); } catch (failure) { setError(failure.message); }
  }

  async function acceptOffer(offer) {
    setError("");
    try {
      const active = await activeSignerContract();
      if (offer.seller.toLowerCase() === wallet.toLowerCase()) throw new Error("You cannot accept your own offer.");
      const value = ethers.parseEther(offer.priceEth);
      await active.acceptOffer.staticCall(offer.id, { value });
      setStatus("Confirm purchase in MetaMask…");
      const tx = await active.acceptOffer(offer.id, { value });
      await tx.wait(); await loadOffers(active); setStatus(`Offer accepted: ${tx.hash}`);
    } catch (failure) { setError(failure.message); }
  }

  return <main className="dashboard"><header><div><p className="eyebrow">Authenticated marketplace</p><h1>EnergyChain</h1><p className="muted">Signed in as {session.user.name} ({session.user.email})</p></div><button className="secondary" onClick={onLogout}>Log out</button></header>
    <section className="wallet-panel"><div><h2>Permanent marketplace wallet</h2><p>{wallet ? `Connected: ${wallet}` : "No wallet connected."}</p><p className="muted">The first wallet you connect is permanently bound to this website account.</p></div><button onClick={connectWallet}>{wallet ? "Verify bound wallet" : "Connect MetaMask"}</button></section>
    {error && <p className="error">{error}</p>}<p className="status">{status}</p>
    <section className="grid"><form className="card" onSubmit={createOffer}><h2>Create energy offer</h2><label>Price in ETH (minimum 0.01)<input type="number" min="0.01" step="0.001" value={price} onChange={(event) => setPrice(event.target.value)} required /></label><button disabled={!contract}>Create offer</button></form>
      <section className="card"><h2>Active offers</h2>{!contract ? <p className="muted">Connect your bound wallet to load offers.</p> : <table><thead><tr><th>ID</th><th>Seller wallet</th><th>Price</th><th>Action</th></tr></thead><tbody>{offers.map((offer) => <tr key={offer.id}><td>#{offer.id}</td><td>{offer.seller}</td><td>{offer.priceEth} ETH</td><td>{offer.seller.toLowerCase() === wallet?.toLowerCase() ? <button className="danger" onClick={() => cancelOffer(offer.id)}>Cancel</button> : <button onClick={() => acceptOffer(offer)}>Accept</button>}</td></tr>)}</tbody></table>}</section>
    </section>
    <section className="card legacy"><h2>Existing modules</h2><p>Bookings, messages, solar, wind, consumption, and historical views remain available during the staged UI migration.</p><a href="/legacy/dashboard">Open existing dashboard modules</a></section>
  </main>;
}

function App() {
  const [session, setSession] = useState(sessionFromStorage());
  useEffect(() => {
    if (!session?.token) return;
    request("/auth/me", session.token).then(({ user }) => {
      const refreshed = { token: session.token, user };
      storeSession(refreshed); setSession(refreshed);
    }).catch(() => { sessionStorage.clear(); setSession(null); });
  }, []);
  const logout = () => { sessionStorage.clear(); setSession(null); };
  return session ? <Dashboard session={session} onLogout={logout} /> : <AuthScreen onAuthenticated={setSession} />;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);
