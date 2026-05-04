function getDifficultyProfile(difficulty = "GED-Level") {
  if (difficulty === "Easy") {
    return {
      difficulty: "Easy",

      // Number ranges
      smallMin: 2,
      smallMax: 8,
      mediumMin: 4,
      mediumMax: 12,
      largeMin: 20,
      largeMax: 100,

      // Percent behavior
      percents: [10, 20, 25, 50],
      discounts: [10, 20, 25],
      percentChanges: [10, 20, 25],

      // Geometry
      lengthMax: 10,
      widthMax: 8,
      triangleMax: 12,
      costMax: 4,

      // Probability
      spinnerSections: 4,
      marbleMax: 5,
      probabilityTargets: "basic",

      // Data / multi-step
      graphMax: 10,
      scoreMin: 70,
      scoreMax: 90,

      // Question style
      allowHardPercentReverse: false,
      allowMultiStep: false,
      allowFill: true
    };
  }

  if (difficulty === "Medium") {
    return {
      difficulty: "Medium",

      smallMin: 3,
      smallMax: 10,
      mediumMin: 6,
      mediumMax: 16,
      largeMin: 40,
      largeMax: 180,

      percents: [10, 15, 20, 25, 30, 40, 50],
      discounts: [10, 15, 20, 25, 30],
      percentChanges: [10, 15, 20, 25, 30],

      lengthMax: 14,
      widthMax: 12,
      triangleMax: 16,
      costMax: 6,

      spinnerSections: 5,
      marbleMax: 7,
      probabilityTargets: "mixed",

      graphMax: 14,
      scoreMin: 60,
      scoreMax: 95,

      allowHardPercentReverse: true,
      allowMultiStep: true,
      allowFill: true
    };
  }

  return {
    difficulty: "GED-Level",

    smallMin: 4,
    smallMax: 14,
    mediumMin: 8,
    mediumMax: 22,
    largeMin: 60,
    largeMax: 300,

    percents: [5, 10, 12, 15, 20, 25, 30, 35, 40, 50],
    discounts: [10, 15, 20, 25, 30, 35, 40],
    percentChanges: [10, 12, 15, 20, 25, 30, 35, 40, 50],

    lengthMax: 20,
    widthMax: 16,
    triangleMax: 24,
    costMax: 9,

    spinnerSections: 6,
    marbleMax: 10,
    probabilityTargets: "ged",

    graphMax: 20,
    scoreMin: 55,
    scoreMax: 100,

    allowHardPercentReverse: true,
    allowMultiStep: true,
    allowFill: true
  };
}

module.exports = {
  getDifficultyProfile
};