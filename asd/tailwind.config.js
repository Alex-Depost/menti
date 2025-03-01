/** @type {import('tailwindcss').Config} */
module.exports = {
    // ...existing code...
    plugins: [
        require('@tailwindcss/typography'),
        // ...other plugins...
    ],
    theme: {
        // ...existing theme...
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: 'inherit',
                        a: {
                            color: 'inherit',
                            textDecoration: 'none',
                        },
                        h1: {
                            color: 'inherit',
                            fontWeight: '700',
                        },
                        h2: {
                            color: 'inherit',
                            fontWeight: '600',
                        },
                        h3: {
                            color: 'inherit',
                            fontWeight: '600',
                        },
                        ul: {
                            listStyleType: 'disc',
                            marginTop: '0.5em',
                            marginBottom: '0.5em',
                        },
                        ol: {
                            listStyleType: 'decimal',
                            marginTop: '0.5em',
                            marginBottom: '0.5em',
                        },
                    },
                },
            },
        },
    },
}
