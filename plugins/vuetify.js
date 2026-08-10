import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2E7D32',
          secondary: '#4CAF50',
          surface: '#E8F5E9',
          background: '#FFFFFF',
          'on-background': '#1A1A1A',
          'on-surface': '#1A1A1A',
          'on-primary': '#FFFFFF',
          'on-secondary': '#1A1A1A',
        },
      },
    },
  },
})
