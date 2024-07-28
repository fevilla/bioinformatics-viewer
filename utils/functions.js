export const replaceCharAt = (str, i, c) => {
  if (i < 0 || i >= str.length) return str;
  return str.substring(0, i) + c + str.substring(i + 1);
};

export const getColorByChar = (char) => {
  switch (char.toLowerCase()) {
    case 'a':
      return 'bg-green-500'; // Adenina
    case 'c':
      return 'bg-yellow'; // Citosina
    case 'd':
      return 'bg-pink-light'; // Ácido aspártico
    case 'e':
      return 'bg-blue-100'; // Ácido glutámico
    case 'g':
      return 'bg-blue-500'; // Guanina
    case 'h':
      return 'bg-blue-300'; // Histidina
    case 'i':
      return 'bg-blue-100'; // Isoleucina
    case 'r':
      return 'bg-green-300'; // Arginina
    case 'n':
      return 'bg-green-100'; // Asparagina
    case 'q':
      return 'bg-red-100'; // Glutamina
    case 'l':
      return 'bg-red-300'; // Leucina
    case 'k':
      return 'bg-red-400'; // Lisina
    case 't':
      return 'bg-red-500'; // Timina
    case 'm':
      return 'bg-indigo'; // Metionina
    case 'f':
      return 'bg-orange-light'; // Fenilalanina
    case 'p':
      return 'bg-brown-light'; // Prolina
    case 's':
      return 'bg-purple-light'; // Serina
    case 'w':
      return 'bg-yellow-light'; // Triptófano
    case 'y':
      return 'bg-linen-green'; // Tirosina
    case 'v':
      return 'bg-light-maroon'; // Valina
    case 'u':
      return 'bg-purple'; //
    default:
      return 'bg-gray-500'; // Default para cualquier otro carácter
  }
};

export const determineType = (sequence) => {
  const types = [];
  const isRNA = /^[AUCG]+$/i.test(sequence);
  const isDNA = /^[ATCG]+$/i.test(sequence);
  const isProtein = /^[ACDEFGHIKLMNPQRSTVWY]+$/i.test(sequence);

  if (isRNA) types.push('RNA');
  if (isDNA) types.push('DNA');
  if (isProtein) types.push('PROTEIN');

  if (types.length === 0) {
    types.push('UNKNOWN');
  }

  return types;
};

export const validateInputLen = (sequences, errors) => {
  const validateSequence = (seq, key) => {
    if (seq.length > 30) {
      if (!errors.value[key]) {
        errors.value[key] = [];
      }
      errors.value[key].push('Debe ser una secuencia de máximo 30 caracteres.');
      return true;
    }
    return false;
  };

  return sequences.some((seq, index) =>
    validateSequence(seq, `seq${index + 1}`)
  );
};

export const validateInputType = (sequences, errors) => {
  let _types = determineType(sequences[0]);
  for (let i = 0; i < sequences.length; i++) {
    const _i = i + 1;
    const sequence = sequences[i];
    const types = determineType(sequence);

    if (types.includes('UNKNOWN')) {
      errors.value.type = ['La secuencia ' + _i + ' es de tipo desconocido'];
      return true;
    }

    const commonTypes = _types.filter((type) => types.includes(type));
    if (commonTypes.length === 0) {
      errors.value.type = ['Las secuencias no son del mismo tipo'];
      _types = types;
      return true;
    }
  }
  return false;
};

export const validateInputs = (sequences, errors) => {
  errors.value = {};
  if (validateInputLen(sequences, errors)) return true;
  if (validateInputType(sequences, errors)) return true;
  return false;
};

export const transcription = (dnaSequence) => {
  let rnaSequence = [];

  for (let i = 0; i < dnaSequence.length; i++) {
    if (dnaSequence[i] === 'g') rnaSequence.push('c');
    else if (dnaSequence[i] === 't') rnaSequence.push('a');
    else if (dnaSequence[i] === 'c') rnaSequence.push('g');
    else if (dnaSequence[i] === 'a') rnaSequence.push('u');
  }

  return rnaSequence.join('');
};
