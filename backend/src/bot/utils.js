// function calculateTargets(entryPrice, direction, tpPercent, slPercent) {
//     const multiplier = direction === 'LONG' ? 1 : -1;
//     return {
//       takeProfit: entryPrice * (1 + (tpPercent / 100 * multiplier)),
//       stopLoss: entryPrice * (1 - (slPercent / 100 * multiplier))
//     };
//   }
  
//   module.exports = { calculateTargets };

  function calculateTargets(entryPrice, direction, tpPercent, slPercent) {
  const isLong = direction === 'LONG';

  return {
    takeProfit: isLong
      ? entryPrice * (1 + tpPercent / 100)
      : entryPrice * (1 - tpPercent / 100),

    stopLoss: isLong
      ? entryPrice * (1 - slPercent / 100)
      : entryPrice * (1 + slPercent / 100)
  };
}

module.exports = { calculateTargets };