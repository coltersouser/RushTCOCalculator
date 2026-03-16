import type { InputSchema } from "../types/schema";

export const inputSchema: InputSchema = {
  "groups": [
    {
      "id": "general",
      "label": "General Information",
      "order": 1
    },
    {
      "id": "diesel",
      "label": "Diesel Baseline Details",
      "order": 2
    },
    {
      "id": "ev",
      "label": "Electric Vehicle Details",
      "order": 3
    },
    {
      "id": "evInfra",
      "label": "EVSE & Infrastructure",
      "order": 4
    },
    {
      "id": "utility",
      "label": "Electricity Pricing",
      "order": 5
    },
    {
      "id": "chargingSplit",
      "label": "Charging Time Split",
      "order": 6,
    },
    {
      "id": "cng",
      "label": "CNG Vehicle Details",
      "order": 7
    },
    {
      "id": "cngStation",
      "label": "CNG Station Details",
      "order": 8
    },
    {
      "id": "financial",
      "label": "Financial Details",
      "order": 9
    }
  ],
  "fields": [
    {
      "key": "general.depreciationYears",
      "label": "Vehicle Lifespan",
      "group": "general",
      "type": "number",
      "default": 7,
      "min": 4,
      "max": 10,
      "step": 1,
      "advanced": true,
      "help": "This is the timeframe in which the modeling is built on (Min 4 Max 10)"
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
      "key": "grant.used",
      "label": "Will there be a grant?",
      "group": "general",
      "type": "toggle",
      "default": false,
      "advanced": true
    },

    {
      "key": "scrap.required",
      "label": "Does the grant require scrappage?",
      "group": "general",
      "type": "toggle",
      "default": false,
      "advanced": true,
      "showWhen": [
        {
          "key": "grant.used",
          "equals": true
        }
      ]
    },


    {
      "key": "general.isDrayageTruck",
      "label": "Drayage truck Clean Truck Fee Applicable?",
      "group": "general",
      "type": "toggle",
      "default": false,
      "advanced": true,
      "help": "Toggle on if POLA/Long beach drayage truck only"
    },
    {
      "key": "general.portTripsPerDay",
      "label": "Port trips per day",
      "group": "general",
      "type": "number",
      "default": 2,
      "min": 0,
      "max": 20,
      "step": 0.5,
      "advanced": true,
      "help": "The number of trips per day will have the fee associated to Diesel and CNG units",
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
      "default": 150,
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
      "label": "Calculate for CA LCFS Credits?",
      "group": "general",
      "type": "toggle",
      "default": false,
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
      "advanced": true,
      "help": "This is needed for LCFS calculations",
       "showWhen": [
        {
          "key": "general.lcfsApplicable",
          "equals": true
        }
      ]
      
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
      "advanced": true,
      "help": "This is needed for LCFS calculations",
       "showWhen": [
        {
          "key": "general.lcfsApplicable",
          "equals": true
        }
      ]
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
      "advanced": true,
      "help": "A good benchmark can be found at https://www.neste.com/investors/market-data/renewable-products",
      "showWhen": [
        {
          "key": "general.lcfsApplicable",
          "equals": true
        }
      ]
    },
    {
      "key": "ev.vehicleCost",
      "label": "Electric Vehicle purchase cost",
      "group": "ev",
      "type": "currency",
      "default": 400000,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "ev.scrapValue",
      "label": "EV grant truck scrap value",
      "group": "ev",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true,
      "help": "How much is the truck worth that is being scrapped for the grant? This is considered a Year 0 cost",
      "showWhen": [
        {
          "key": "scrap.required",
          "equals": true
        }
      ]
    },
    {
      "key": "ev.grantValue",
      "label": "EV grant value",
      "group": "ev",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 500000,
      "step": 1000,
      "advanced": false,
      "showWhen": [
        {
          "key": "grant.used",
          "equals": true
        }
      ]
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
      "advanced": true,
      "help": "If assuming a cash deal leave at 100%"
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
      "label": "Assumed residual value for EV at end of term",
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
      "min": 0.5,
      "max": 10,
      "step": 0.05,
      "advanced": false,
      "help": "Safe fallback assumptions: (Class 5 = .8) (Class 6 = 1) (Class 7 = 1.4) (Class 8 = 2)"
    },
    {
  "key": "ev.simultaneousChargingFactor",
  "label": "Simultaneous Charging Factor",
  "group": "ev",
  "type": "percent",
  "default": 1,
  "min": .1,
  "max": 1,
  "step": .05,
  "advanced": true,
  "help": "Percent of trucks that will be charging at the same time. This will have an effect on demand charge cost calculations in the EVSE section"
},
    
    {
      "key": "evInfra.chargerCost",
      "label": "EVSE (Charger) purchase cost",
      "group": "evInfra",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 500000,
      "step": 500,
      "advanced": true,
      "help": "This should be the cost for EACH not total"
    },
    {
      "key": "evInfra.chargerLifeYears",
      "label": "Charger lifespan (years)",
      "group": "evInfra",
      "type": "number",
      "default": 10,
      "min": 1,
      "max": 40,
      "step": 1,
      "advanced": true,
      "help": "How long do you expect a charger to last. 10 years for a reputable charger should be an OK assumption"
    },
    {
      "key": "evInfra.chargerFunding",
      "label": "Grant funding received for charging install",
      "group": "evInfra",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 5000000,
      "step": 1000,
      "advanced": true
    },
    {
      "key": "evInfra.infrastructureCostPerCharger",
      "label": "Infrastructure cost per charger",
      "group": "evInfra",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 5000000,
      "step": 100,
      "advanced": true
    },
    {
      "key": "evInfra.infrastructureLifeYears",
      "label": "Infrastructure lifespan (years)",
      "group": "evInfra",
      "type": "number",
      "default": 30,
      "min": 1,
      "max": 60,
      "step": 1,
      "advanced": true,
      "help": "How long do you expect greater infrastructure to last (transfomers, underground components, concrete pads, etc.) 30 years is base assumption"
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
      "advanced": true,
      "help": "How many chargers will be installed"
    },
    {
      "key": "evInfra.cmsCostPerChargerPerYear",
      "label": "Charge Management Software (CMS) cost per charger / year",
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
      "advanced": true,
      "help": "If assuming a cash deal leave at 100%"
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
      "group": "general",
      "type": "percent",
      "default": 0.8,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "help": "If using a broker to monetize LCFS what percentage is expected to be retained",
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
      "help": "Demand charge is different than electricity cost. This is a charger per kW drawn at a given time should be available on a utility bill",
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
      "help": "Most utilities charge a monthly fee for services customer charge is just one thing they call it but it has different names based on utility company",
      "advanced": true
    },
    {
      "key": "utility.scePhasedDemandCharge",
      "label": "SCE phased-in demand charge",
      "group": "utility",
      "type": "toggle",
      "default": false,
      "advanced": true,
      "help": "Toggle ON ONLY if Southern California Edison is the utility provider"
    },
    {
      "key": "utility.isTouSchedule",
      "label": "Time of Use rate schedule",
      "group": "utility",
      "type": "toggle",
      "default": false,
      "advanced": true,
      "help": "Toggle ON only if customer is on a Time of Use rate Schedule"
    },
    {
      "key": "utility.rateSummerOnPeak",
      "label": "Summer on-peak rate ($/kWh)",
      "group": "utility",
      "type": "currency",
      "default": 0.80,
      "min": 0,
      "max": 2,
      "step": 0.001,
      "advanced": true,
      "help": "",
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
      "key": "ev.pctChargeSuperOffPeak",
      "label": "% Charging in Off-Peak (This group must total to 100%)",
      "group": "chargingSplit",
      "type": "number",
      "default": 70,
      "min": 0,
      "max": 100,
      "step": 1,
      "advanced": true,
      "help": "9 p.m. to 6 a.m.",
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "ev.pctChargeOffPeak",
      "label": "% Charging in Mid-Peak",
      "group": "chargingSplit",
      "type": "number",
      "default": 25,
      "min": 0,
      "max": 100,
      "step": 1,
      "advanced": true,
      "help": "6 a.m to 4 p.m.",
      "showWhen": [
        {
          "key": "utility.isTouSchedule",
          "equals": true
        }
      ]
    },
    {
      "key": "ev.pctChargeMidOnPeak",
      "label": "% Charging in On Peak",
      "group": "chargingSplit",
      "type": "number",
      "default": 5,
      "min": 0,
      "max": 100,
      "step": 1,
      "advanced": true,
      "help": "4 p.m. to 9 p.m.",
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
      "default": 6.5,
      "min": 0,
      "max": 30,
      "step": 0.1,
      "advanced": true
    },
    {
      "key": "cng.truckCost",
      "label": "CNG truck purchase cost",
      "group": "cng",
      "type": "currency",
      "default": 230000,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "cng.scrapValue",
      "label": "CNG grant truck scrap value",
      "group": "cng",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true,
      "help": "How much is the truck worth that is being scrapped for the grant? This is considered a Year 0 cost",
      "showWhen": [
        {
          "key": "scrap.required",
          "equals": true
        }
      ]
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
      "advanced": false,
      "showWhen": [
        {
          "key": "grant.used",
          "equals": true
        }
      ]
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
      "default": 1,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "help": "If assuming a cash deal leave at 100%"
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
      "label": "Assumed residual value for CNG vehilce at end of term",
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
      "group": "general",
      "type": "percent",
      "default": 0.8,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "help": "If using a broker to monetize LCFS what percentage is expected to be retained",
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
      "default": false,
      "advanced": true,
      "help": "This should only be considered on large truck deployments",
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
      "key": "cngStation.stationLifeYears",
      "label": "CNG Station Lifespan (years)",
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
      "default": 1,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "help": "If assuming a cash deal leave at 100%",
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
      "default": 5.00,
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
      "default": 7,
      "min": 0,
      "max": 30,
      "step": 0.1,
      "advanced": false
    },
    {
      "key": "diesel.truckCost",
      "label": "Diesel truck purchase cost",
      "group": "diesel",
      "type": "currency",
      "default": 160000,
      "min": 0,
      "max": 2000000,
      "step": 1000,
      "advanced": false
    },
    {
      "key": "diesel.scrapValue",
      "label": "Diesel grant truck scrap value",
      "group": "diesel",
      "type": "currency",
      "default": 0,
      "min": 0,
      "max": 1000000,
      "step": 1000,
      "advanced": true,
      "help": "How much is the truck worth that is being scrapped for the grant? This is considered a Year 0 cost",
      "showWhen": [
        {
          "key": "scrap.required",
          "equals": true
        }
      ]
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
      "advanced": true,
      "showWhen": [
        {
          "key": "grant.used",
          "equals": true
        }
      ]
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
      "default": 1,
      "min": 0,
      "max": 1,
      "step": 0.05,
      "advanced": true,
      "help": "If assuming a cash deal leave at 100%"
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
      "label": "Assumed residual value for diesel vehicle at end of term",
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
      "group": "general",
      "type": "currency",
      "default": 20,
      "min": 0,
      "max": 500,
      "step": 1,
      "advanced": true,
      "help": "$10 per twenty foot equivalent (TEU) 20' container = $10 40' container = $20",
      "showWhen": [
        {
          "key": "general.isDrayageTruck",
          "equals": true
        }
      ]
    },
    {
      "key": "cng.fuelPricePerGge",
      "label": "CNG fuel price ($/DGE)",
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
      "key": "general.modelStartYear",
      "label": "Model start year",
      "group": "general",
      "type": "number",
      "default": 2026,
      "min": 2026,
      "max": 2050,
      "step": 1,
      "advanced": true,
      "help": "Year 0 will be labeled as this year. Year 1 = start year + 1. Some calculations like LCFS are based on this year"
    }
  ]
};
