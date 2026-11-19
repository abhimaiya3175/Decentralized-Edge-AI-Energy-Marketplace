# Energy Consumption Model Report

## Dataset validation

- Source: `data\Energy_consumption.csv`
- Rows after chronological sorting and duplicate removal: 1000
- Missing required values: {'Timestamp': 0, 'Temperature': 0, 'Humidity': 0, 'SquareFootage': 0, 'Occupancy': 0, 'HVACUsage': 0, 'LightingUsage': 0, 'RenewableEnergy': 0, 'DayOfWeek': 0, 'Holiday': 0, 'EnergyConsumption': 0}
- Duplicate rows removed: 0
- Training period: 2022-01-01 00:00:00 to 2022-02-03 07:00:00
- Validation period: 2022-02-03 08:00:00 to 2022-02-11 15:00:00
- Target unit: dataset-defined unit (not specified)

## Time-aware validation

The earliest 80% of rows form the training set and the latest 20% form the validation set. No future rows are used to predict earlier rows.

| Model | MAE | MSE | RMSE | R² |
| --- | ---: | ---: | ---: | ---: |
| LinearRegression | 4.1222 | 25.0182 | 5.0018 | 0.5917 |
| RandomForestRegressor | 4.1974 | 26.5281 | 5.1505 | 0.5671 |
| GradientBoostingRegressor | 4.0979 | 25.2387 | 5.0238 | 0.5881 |

Selected model: **LinearRegression** (lowest chronological validation RMSE).

## Features

Temperature, Humidity, SquareFootage, Occupancy, RenewableEnergy, hour, day, month, is_weekend, HVACUsage, LightingUsage, DayOfWeek, Holiday

The dataset does not declare a physical unit for `EnergyConsumption`; predictions retain the dataset-defined unit without assigning an unsupported label.
