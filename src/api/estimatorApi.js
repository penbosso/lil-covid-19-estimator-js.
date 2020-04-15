/* eslint-disable linebreak-style */
/* eslint-disable no-console */
/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
/* eslint-disable max-len */

const ResopnseLog = require('../model/ResponseLog');

exports.estimatorJsonV1 = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: 'course content can not be empty'
    });
  }
  const result = getExtimates(req.body);

  if (missingEssentialAttr(req.body)) {
    res.status(400).send({
      message: 'An importanat filled is missing in the data.'
    });
  }
  return res.status(200).json(result);
};
exports.estimatorXmlV1 = (req, res) => {
  const result = getExtimates(req.body);

  if (missingEssentialAttr(req.body)) {
    res.status(400).send({
      message: 'An importanat filled is missing in the data.'
    });
  }
  return res.header('Content-Type', 'text/xml').send(result);
};

exports.estimatorLogsV1 = async (req, res) => {
  let textData = '';
  const logs = await ResopnseLog.find({});

  logs.forEach((log) => {
    textData += `${log.method} \t\t ${log.url} \t\t ${log.statusCode} \t\t  Done in ${log.time}ms \n`;
  });

  res.header('Content-Type', 'text/plain').send(textData);
};

const missingEssentialAttr = (data) => {
  if (!data.region.avgDailyIncomeInUSD
    || !data.region.avgDailyIncomePopulation
    || !data.periodType
    || !data.timeToElapse
    || !data.reportedCases
    || !data.population
    || !data.totalHospitalBeds) {
    return true;
  }
  return false;
};

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

  newData.impact.hospitalBedsByRequestedTime = Math.floor(0.35 * data.totalHospitalBeds - newData.impact.severeCasesByRequestedTime) + 1;
  newData.severeImpact.hospitalBedsByRequestedTime = Math.floor(0.35 * data.totalHospitalBeds - newData.severeImpact.severeCasesByRequestedTime) + 1;

  // Challenge 3
  newData.impact.casesForICUByRequestedTime = Math.floor(newData.impact.infectionsByRequestedTime * 0.05);
  newData.severeImpact.casesForICUByRequestedTime = Math.floor(newData.severeImpact.infectionsByRequestedTime * 0.05);

  newData.impact.casesForVentilatorsByRequestedTime = Math.floor(newData.impact.infectionsByRequestedTime * 0.02);
  newData.severeImpact.casesForVentilatorsByRequestedTime = Math.floor(newData.severeImpact.infectionsByRequestedTime * 0.02);

  newData.impact.dollarsInFlight = Math.floor((newData.impact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD) / timeToElapse);
  newData.severeImpact.dollarsInFlight = Math.floor((newData.severeImpact.infectionsByRequestedTime * data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD) / timeToElapse);

  return newData;
};
