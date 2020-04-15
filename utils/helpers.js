const Regex = function buildRegex(pattern, flags) {
  return new RegExp(pattern.replace(/\s/g, ''), flags);
};

module.exports = Object.freeze({ Regex });
