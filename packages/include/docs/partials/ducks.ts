export function bugsFixed(ducks: number) {
  // #region estimate
  const bugs = Math.round(ducks * 0.94);
  return bugs;
  // #endregion estimate
}

export function ducksNeeded(bugs: number) {
  return Math.ceil(bugs / 0.94);
}
