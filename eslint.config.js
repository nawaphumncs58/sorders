import vuetify from 'eslint-config-vuetify'

export default vuetify(
  { ts: false },
  {
    rules: {
      // Pinia's Options API store syntax (state/getters/actions using
      // `this`) is the idiomatic pattern used throughout src/stores/**
      // and isn't a real "class" — this rule doesn't understand that.
      'unicorn/no-this-outside-of-class': 'off',
    },
  },
  {
    files: ['scripts/**'],
    rules: {
      // scripts/seed.mjs is a Node CLI tool, not app code.
      'unicorn/no-process-exit': 'off',
    },
  },
)
