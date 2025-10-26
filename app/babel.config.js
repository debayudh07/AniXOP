module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { unstable_transformImportMeta: true }],
      ['nativewind/babel', { unstable_transformImportMeta: true }]
    ],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
