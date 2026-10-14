export const euclideanDistance = (desc1: number[] | Float32Array, desc2: number[] | Float32Array): number => {
  if (desc1.length !== desc2.length) return Number.MAX_VALUE;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

// Generate an array of 128 random floats for each mock case we have
export const mockupVectorDatabase = [
  {
    caseId: "case_1", // Maps to mockCases[0]
    descriptor: Array.from({ length: 128 }, () => Math.random())
  },
  {
    caseId: "case_2", // Maps to mockCases[1]
    descriptor: Array.from({ length: 128 }, () => Math.random())
  }
];
