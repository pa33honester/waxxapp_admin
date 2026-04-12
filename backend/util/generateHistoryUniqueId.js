function generateHistoryUniqueId(prefix = "HIS") {
  const randomLength = 10 - prefix.length; // remaining characters
  let randomPart = "";

  while (randomPart.length < randomLength) {
    randomPart += Math.random().toString(36).substring(2).toUpperCase();
  }

  randomPart = randomPart.substring(0, randomLength);

  return `${prefix}${randomPart}`; // single string, not array
}

module.exports = { generateHistoryUniqueId };
