import type { InputSchema } from "../types/schema";

export const inputSchema: InputSchema = {
  "groups": [
    {
      "id": "general",
      "label": "General",
      "order": 1
    },
    {
      "id": "diesel",
      "label": "Diesel",
      "order": 2
    },
    {
      "id": "ev",
      "label": "Electric",
      "order": 3
    },
    {
      "id": "evInfra",
      "label": "EV Infrastructure",
      "order": 4
    },
    {
      "id": "utility",
      "label": "Utility Pricing",
      "order": 5
    },
    {
      "id": "chargingSplit",
      "label": "Charging Time Split",
      "order": 6
    },
    {
      "id": "cng",
      "label": "CNG",
      "order": 7
    },
    {
      "id": "cngStation",
      "label": "CNG Station",
      "order": 8
    },
    {
      "id": "financial",
      "label": "Financial",
      "order": 9
    }
  ],
  "fields": [
    {
      "key": "general.depreciationYears",
      "label": "Depreciation schedule (years)",
      "group": "general",
      "type": "number",
      "default": 7,
      "min": 1,
      "max": 30,
      "step": 1,
      "advanced": true
    },
    {
      "key": "general.vehicleCount",
      "label": "Number of vehicles",
      "group": "general",
      "type": "number",
      "default": 1,
      "min": 1,
      "max": 5000,
      "step": 1,
      "advanced": false
    },
    {
      "key": "general.waireApplicable",
      "label": "WAIRE applicable",
      "group": "general",
      "type": "toggle",
      "default": true,
      "advanced": true
    },
    {
      "key": "general.warehouseVisitsPerYearPerVehicle",
      "label": "Warehouse visits per year (per vehicle)",
      "group": "general",
      "type": "number",
      "default": 280,
      "min": 0,
      "max": 2000,
      "step": 1,
      "advanced": true
    },
    {
      "key": "general.isDrayageTruck",
      "label": "Drayage truck (Ports / Clean Truck Fee)",
      "group": "general",
      "type": "toggle",
      "default": false,
      "advanced": true
    },
    {
      "key": "general.portTripsPerDay",
      "label": "Port trips per day (LA/LB)",
      "group": "general",
      "type": "number",
      "default": 2,
      "min": 0,
      "max": 20,
      "step": 0.5,
      "advanced": true,
      "showWhen": [
        {
          "key": "general.isDrayageTruck",
          "equals": true
        }
      ]
    },
    {
      "key": "general.milesPerDayPerTruck",
      "label": "Miles per day (per truck)",
      "group": "general",
      "type": "number",
      "default": 300,
      "min": 0,
      "max": 1000,
      "step": 1,
      "advanced": false
    },
    {
      "key": "general.workDaysPerYear",
      "label": "Work days per year",
      "group": "general",
      "type": "number",
      "default": 280,
      "min": 0,
      "max": 365,
      "step": 1,
      "advanced": false
    },
    {
      "key": "general.lcfsApplicable",
      "label": "CA LCFS applicable",
      "group": "general",
      "type": "toggle",
      "default": true,
      "advanced": true
    },
    {
      "key": "general.electricityCarbonIntensity",
      "label": "Electricity carbon intensity",
      "group": "general",
      "type": "number",
      "default": 0,
      "min": 0,
      "max": 200,
      "step": 1,
      "advanced": true
    },
    {
      "key": "general.ngCarbonIntensity",
      "label": "NG carbon intensity",
      "group": "general",
      "type": "number",
      "default": 43,
      "min": 0,
      "max": 200,
      "step": 1,
      "advanced": true
    },
    {
      "key": "general.lcfsCreditValuePerUnit",
      "label": "LCFS credit value ($/credit)",
      "group": "general",
      "type": "currency",
      "default": 80,
      "min": 0,
      "max": 500,
      "step": 1,
      "advanced": true
    },
    {
      "key": "ev.vehicleCost",
      "label": "EV vehicle cost",
      "group": "ev",
      "type": "currency",
      "default": 400000,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "ev.grantTruckScrapValue",
      "label": "EV grant truck scrap value",
      "group": "ev",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "ev.grantValue",
      "label": "EV grant value",
      "group": "ev",
      "type": "currency",
      "default": 40000,
      "min": 0,
      "max": 500000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "ev.financingRateApr",
      "label": "EV financing rate (APR)",
      "group": "ev",
      "type": "percent",
      "default": 0.05,
      "min": 0,
      "max": 0.35,
      "step": 0.0025,
      "advanced": true
    },
    {
      "key": "ev.downPaymentPct",
      "label": "EV down payment",
      "group": "ev",
      "type": "percent",
      "default": 1,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true
    },
    {
      "key": "ev.financingTermYears",
      "label": "EV financing term (years)",
      "group": "ev",
      "type": "number",
      "default": 6,
      "min": 0,
      "max": 15,
      "step": 1,
      "advanced": true
    },
    {
      "key": "ev.residualValue",
      "label": "EV residual value",
      "group": "ev",
      "type": "currency",
      "default": 10000,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "ev.hoursAvailableForCharging",
      "label": "Hours available for charging",
      "group": "ev",
      "type": "number",
      "default": 12,
      "min": 0,
      "max": 24,
      "step": 0.5,
      "advanced": true
    },
    {
      "key": "ev.kwhPerMile",
      "label": "EV efficiency (kWh/mile)",
      "group": "ev",
      "type": "number",
      "default": 2,
      "min": 0,
      "max": 10,
      "step": 0.05,
      "advanced": false
    },
    {
      "key": "evInfra.chargerCost",
      "label": "Charger cost",
      "group": "evInfra",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 500000,
      "step": 500,
      "advanced": true
    },
    {
      "key": "evInfra.chargerLifespanYears",
      "label": "Charger lifespan (years)",
      "group": "evInfra",
      "type": "number",
      "default": 10,
      "min": 1,
      "max": 40,
      "step": 1,
      "advanced": true
    },
    {
      "key": "evInfra.chargerFunding",
      "label": "Charger funding",
      "group": "evInfra",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 500000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "evInfra.infrastructureCostPerCharger",
      "label": "Infrastructure cost per charger",
      "group": "evInfra",
      "type": "currency",
      "default": 0.01,
      "min": 0,
      "max": 5000000,
      "step": 100,
      "advanced": true
    },
    {
      "key": "evInfra.infrastructureDepreciationYears",
      "label": "Infrastructure depreciation (years)",
      "group": "evInfra",
      "type": "number",
      "default": 30,
      "min": 1,
      "max": 60,
      "step": 1,
      "advanced": true
    },
    {
      "key": "evInfra.chargerQuantity",
      "label": "Charger quantity",
      "group": "evInfra",
      "type": "number",
      "default": 0,
      "min": 0,
      "max": 500,
      "step": 1,
      "advanced": true
    },
    {
      "key": "evInfra.cmsCostPerChargerPerYear",
      "label": "CMS cost per charger / year",
      "group": "evInfra",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 50000,
      "step": 100,
      "advanced": true
    },
    {
      "key": "evInfra.financingRateApr",
      "label": "Infrastructure financing rate (APR)",
      "group": "evInfra",
      "type": "percent",
      "default": 0.05,
      "min": 0,
      "max": 0.35,
      "step": 0.0025,
      "advanced": true
    },
    {
      "key": "evInfra.downPaymentPct",
      "label": "Infrastructure down payment",
      "group": "evInfra",
      "type": "percent",
      "default": 1,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true
    },
    {
      "key": "evInfra.financingTermYears",
      "label": "Infrastructure financing term (years)",
      "group": "evInfra",
      "type": "number",
      "default": 15,
      "min": 0,
      "max": 40,
      "step": 1,
      "advanced": true
    },
    {
      "key": "evInfra.lcfsCreditShare",
      "label": "LCFS credit share (EV)",
      "group": "evInfra",
      "type": "percent",
      "default": 0.8,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "showWhen": [
        {
          "key": "general.lcfsApplicable",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.demandChargeRate",
      "label": "Demand charge rate ($/kW)",
      "group": "utility",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 200,
      "step": 0.5,
      "advanced": true
    },
    {
      "key": "utility.customerCharge",
      "label": "Customer charge ($/month)",
      "group": "utility",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 5000,
      "step": 10,
      "advanced": true
    },
    {
      "key": "utility.scePhasedDemandCharge",
      "label": "SCE phased-in demand charge",
      "group": "utility",
      "type": "toggle",
      "default": true,
      "advanced": true
    },
    {
      "key": "utility.isTouSchedule",
      "label": "TOU rate schedule",
      "group": "utility",
      "type": "toggle",
      "default": true,
      "advanced": true
    },
    {
      "key": "utility.rateSummerOnPeak",
      "label": "Summer on-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.08,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.rateSummerMidPeak",
      "label": "Summer mid-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.33723,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.rateSummerOffPeak",
      "label": "Summer off-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.14926,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.rateWinterMidPeak",
      "label": "Winter mid-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.37882,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.rateWinterOffPeak",
      "label": "Winter off-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.15603,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.rateWinterSuperOffPeak",
      "label": "Winter super off-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.09709,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "utility.flatRateKwh",
      "label": "Flat electricity rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.18,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": false,
      "help": "Used when TOU schedule is OFF.",
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": false
        }
      ]
    },
    {
      "key": "chargingSplit.summerOnPeakPct",
      "label": "% Summer On-Peak",
      "group": "chargingSplit",
      "type": "percent",
      "default": 1,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "chargingSplit.summerMidPeakPct",
      "label": "% Summer Mid-Peak",
      "group": "chargingSplit",
      "type": "percent",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "chargingSplit.summerOffPeakPct",
      "label": "% Summer Off-Peak",
      "group": "chargingSplit",
      "type": "percent",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "chargingSplit.winterMidPeakPct",
      "label": "% Winter Mid-Peak",
      "group": "chargingSplit",
      "type": "percent",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "chargingSplit.winterOffPeakPct",
      "label": "% Winter Off-Peak",
      "group": "chargingSplit",
      "type": "percent",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "chargingSplit.winterSuperOffPeakPct",
      "label": "% Winter Super Off-Peak",
      "group": "chargingSplit",
      "type": "percent",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.01,
      "advanced": true,
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "cng.mpg",
      "label": "CNG fuel economy (mpg)",
      "group": "cng",
      "type": "number",
      "default": 6.8,
      "min": 0,
      "max": 30,
      "step": 0.1,
      "advanced": true
    },
    {
      "key": "cng.truckCost",
      "label": "CNG truck cost",
      "group": "cng",
      "type": "currency",
      "default": 230000,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "cng.grantTruckScrapValue",
      "label": "CNG grant truck scrap value",
      "group": "cng",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "cng.grantValue",
      "label": "CNG grant value",
      "group": "cng",
      "type": "currency",
      "default": null,
      "min": 0,
      "max": 500000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "cng.financingRateApr",
      "label": "CNG financing rate (APR)",
      "group": "cng",
      "type": "percent",
      "default": 0.05,
      "min": 0,
      "max": 0.35,
      "step": 0.0025,
      "advanced": true
    },
    {
      "key": "cng.downPaymentPct",
      "label": "CNG down payment",
      "group": "cng",
      "type": "percent",
      "default": 0.2,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true
    },
    {
      "key": "cng.financingTermYears",
      "label": "CNG financing term (years)",
      "group": "cng",
      "type": "number",
      "default": 7,
      "min": 0,
      "max": 15,
      "step": 1,
      "advanced": true
    },
    {
      "key": "cng.residualValue",
      "label": "CNG residual value",
      "group": "cng",
      "type": "currency",
      "default": 45000,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "cng.maintenanceCostPerMile",
      "label": "CNG maintenance cost ($/mile)",
      "group": "cng",
      "type": "currency",
      "default": 0.25,
      "min": 0,
      "max": 5,
      "step": 0.01,
      "advanced": true
    },
    {
      "key": "cng.lcfsCreditShare",
      "label": "LCFS credit share (CNG)",
      "group": "cng",
      "type": "percent",
      "default": 0,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "showWhen": [
        {
          "key": "general.lcfsApplicable",
          "equals": true
        }
      ]
    },
    {
      "key": "cngStation.installingStation",
      "label": "Installing CNG filling station",
      "group": "cngStation",
      "type": "toggle",
      "default": true,
      "advanced": true
    },
    {
      "key": "cngStation.installationCost",
      "label": "CNG station installation cost",
      "group": "cngStation",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 20000000,
      "step": 10000,
      "advanced": true,
      "showWhen": [
        {
          "key": "cngStation.installingStation",
          "equals": true
        }
      ]
    },
    {
      "key": "cngStation.yearlyMaintenanceCost",
      "label": "CNG station yearly maintenance",
      "group": "cngStation",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": true,
      "showWhen": [
        {
          "key": "cngStation.installingStation",
          "equals": true
        }
      ]
    },
    {
      "key": "cngStation.capitalDepreciationYears",
      "label": "Station depreciation (years)",
      "group": "cngStation",
      "type": "number",
      "default": 30,
      "min": 1,
      "max": 60,
      "step": 1,
      "advanced": true,
      "showWhen": [
        {
          "key": "cngStation.installingStation",
          "equals": true
        }
      ]
    },
    {
      "key": "cngStation.financingRateApr",
      "label": "Station financing rate (APR)",
      "group": "cngStation",
      "type": "percent",
      "default": 0.05,
      "min": 0,
      "max": 0.35,
      "step": 0.0025,
      "advanced": true,
      "showWhen": [
        {
          "key": "cngStation.installingStation",
          "equals": true
        }
      ]
    },
    {
      "key": "cngStation.downPaymentPct",
      "label": "Station down payment",
      "group": "cngStation",
      "type": "percent",
      "default": 0.2,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "showWhen": [
        {
          "key": "cngStation.installingStation",
          "equals": true
        }
      ]
    },
    {
      "key": "cngStation.financingTermYears",
      "label": "Station financing term (years)",
      "group": "cngStation",
      "type": "number",
      "default": 7,
      "min": 0,
      "max": 30,
      "step": 1,
      "advanced": true,
      "showWhen": [
        {
          "key": "cngStation.installingStation",
          "equals": true
        }
      ]
    },
    {
      "key": "diesel.pricePerGallon",
      "label": "Diesel price ($/gal)",
      "group": "diesel",
      "type": "currency",
      "default": 4.97,
      "min": 0,
      "max": 20,
      "step": 0.01,
      "advanced": false
    },
    {
      "key": "diesel.defPrice",
      "label": "DEF price ($/gal)",
      "group": "diesel",
      "type": "currency",
      "default": 4.5,
      "min": 0,
      "max": 20,
      "step": 0.01,
      "advanced": true
    },
    {
      "key": "diesel.defDosingPct",
      "label": "DEF dosing percentage",
      "group": "diesel",
      "type": "percent",
      "default": 0.04,
      "min": 0,
      "max": 0.2,
      "step": 0.005,
      "advanced": true
    },
    {
      "key": "diesel.mpg",
      "label": "Diesel fuel economy (mpg)",
      "group": "diesel",
      "type": "number",
      "default": 8,
      "min": 0,
      "max": 30,
      "step": 0.1,
      "advanced": false
    },
    {
      "key": "diesel.truckCost",
      "label": "Diesel truck cost",
      "group": "diesel",
      "type": "currency",
      "default": 160000,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "diesel.grantTruckScrapValue",
      "label": "Diesel grant truck scrap value",
      "group": "diesel",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "diesel.grantValue",
      "label": "Diesel grant value",
      "group": "diesel",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 500000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "diesel.financingRateApr",
      "label": "Diesel financing rate (APR)",
      "group": "diesel",
      "type": "percent",
      "default": 0.05,
      "min": 0,
      "max": 0.35,
      "step": 0.0025,
      "advanced": true
    },
    {
      "key": "diesel.downPaymentPct",
      "label": "Diesel down payment",
      "group": "diesel",
      "type": "percent",
      "default": 0.2,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true
    },
    {
      "key": "diesel.financingTermYears",
      "label": "Diesel financing term (years)",
      "group": "diesel",
      "type": "number",
      "default": 6,
      "min": 0,
      "max": 15,
      "step": 1,
      "advanced": true
    },
    {
      "key": "diesel.residualValue",
      "label": "Diesel residual value",
      "group": "diesel",
      "type": "currency",
      "default": 5000,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "diesel.maintenanceCostPerMile",
      "label": "Diesel maintenance cost ($/mile)",
      "group": "diesel",
      "type": "currency",
      "default": 0.25,
      "min": 0,
      "max": 5,
      "step": 0.01,
      "advanced": true
    },
    {
      "key": "financial.inflationRate",
      "label": "Inflation rate",
      "group": "financial",
      "type": "percent",
      "default": 0.03,
      "min": 0,
      "max": 0.2,
      "step": 0.0025,
      "advanced": true
    },
    {
      "key": "diesel.cleanTruckPortFee",
      "label": "Clean Truck Port Fee ($/trip)",
      "group": "diesel",
      "type": "currency",
      "default": 20,
      "min": 0,
      "max": 500,
      "step": 1,
      "advanced": true,
      "help": "Used when Drayage truck is ON."
    },
    {
      "key": "cng.fuelPricePerGge",
      "label": "CNG fuel price ($/GGE)",
      "group": "cng",
      "type": "currency",
      "default": 3.5,
      "min": 0,
      "max": 20,
      "step": 0.01,
      "advanced": false
    },
    {
      "key": "ev.maintenanceCostPerMileBase",
      "label": "EV maintenance cost ($/mile)",
      "group": "ev",
      "type": "currency",
      "default": 0.18,
      "min": 0,
      "max": 5,
      "step": 0.01,
      "advanced": true,
      "help": "If you want to override the built-in 60% rule, set this and toggle override on."
    },
    {
      "key": "ev.overrideMaintenance",
      "label": "Override EV maintenance input",
      "group": "ev",
      "type": "toggle",
      "default": false,
      "advanced": true,
      "help": "If OFF, EV maintenance = 60% of the higher of Diesel/CNG maintenance (inflated)."
    },
    {
      "key": "waire.overrideAnnualValue",
      "label": "Override WAIRE annual value (fleet, $/yr)",
      "group": "general",
      "type": "currency",
      "default": 0,
      "min": -100000000,
      "max": 100000000,
      "step": 1000,
      "advanced": true,
      "help": "Temporary: enter your WAIRE annual credit/cost for fleet. Negative = credit."
    },
    {
      "key": "waire.useOverride",
      "label": "Use WAIRE override",
      "group": "general",
      "type": "toggle",
      "default": false,
      "advanced": true
    },
    {
      "key": "general.modelStartYear",
      "label": "Model start year (Year 0)",
      "group": "general",
      "type": "number",
      "default": 2026,
      "min": 2020,
      "max": 2050,
      "step": 1,
      "advanced": true,
      "help": "Year 0 will be labeled as this year. Year 1 = start year + 1."
    }
  ]
};
