module.exports = {
  presets: [
    [require.resolve('@babel/preset-env'), {
      targets: {
        browsers: [
          '>0.25%',
          'not ie 11',
          'not op_mini all',
        ],
      },
      modules: false,
    }],
  ],
};
