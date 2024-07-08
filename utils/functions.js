export const replaceCharAt = (str, i, c) => {
  if (i < 0 || i >= str.length) return str;
  return str.substring(0, i) + c + str.substring(i + 1);
};

export const getColorByChar = (char) => {
  switch (char) {
    case 'a':
      return 'bg-green-500'; // Adenina
    case 't':
      return 'bg-red-500'; // Timina
    case 'g':
      return 'bg-blue-500'; // Guanina
    case 'c':
      return 'bg-yellow'; // Citosina
    default:
      return 'bg-gray-500'; // Default para cualquier otro carácter
  }
};
