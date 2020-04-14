/* eslint-disable linebreak-style */
/* eslint-disable max-len */

const getExtimates = (data) => {
  const newData = {};
  let { timeToElapse } = data;
  newData.data = data;
  newData.impact = {};
  newData.severeImpact = {};
  if (data.periodType === 'weeks') {
    timeToElapse = data.timeToElapse * 7;
  } else if (data.periodType === 'months') {
    timeToElapse = data.timeToElapse * 30;
  } else if (data.periodType === 'years') {
    timeToElapse = data.timeToElapse * 365;
  }
  // Challenge 1
  const infectionFactor = Math.floor(timeToElapse / 3);
  newData.impact.currentlyInfected = data.reportedCases * 10;
  newData.severeImpact.currentlyInfected = data.reportedCases * 50;
  newData.impact.infectionsByRequestedTime = newData.impact.currentlyInfected * 2 ** infectionFactor;
  newData.severeImpact.infectionsByRequestedTime = newData.severeImpact.currentlyInfected * 2 ** infectionFactor;

  // Challenge 2
  newData.impact.severeCasesByRequestedTime = Math.floor(newData.impact.infectionsByRequestedTime * 0.15);
  newData.severeImpact.severeCasesByRequestedTime = Math.floor(newData.severeImpact.infectionsByRequestedTime * 0.15);

  newData.impact.hospitalBedsByRequestedTime = Math.floor(0.35 * data.totalHospitalBeds) - newData.impact.severeCasesByRequestedTime;
  newData.severeImpact.hospitalBedsByRequestedTime = Math.floor(0.35 * data.totalHospitalBeds) - newData.severeImpact.severeCasesByRequestedTime;

  // Challenge 3
  newData.impact.casesForICUByRequestedTime = Math.floor(newData.impact.infectionsByRequestedTime * 0.05);
  newData.severeImpact.casesForICUByRequestedTime = Math.floor(newData.severeImpact.infectionsByRequestedTime * 0.05);

  newData.impact.casesForVentilatorsByRequestedTime = Math.floor(newData.impact.infectionsByRequestedTime * 0.02);
  newData.severeImpact.casesForVentilatorsByRequestedTime = Math.floor(newData.severeImpact.infectionsByRequestedTime * 0.02);

  newData.impact.dollarsInFlight = Math.floor(newData.impact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD * data.region.avgDailyIncomePopulation * timeToElapse);
  newData.severeImpact.dollarsInFlight = Math.floor(newData.severeImpact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD * data.region.avgDailyIncomePopulation * timeToElapse);

  return newData;
};


const covid19ImpactEstimator = (data) => getExtimates(data);


export default covid19ImpactEstimator;
