tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            "colors": {
                "on-primary-fixed-variant": "#7a2a2a",
                "inverse-primary": "#a83131",
                "on-tertiary-fixed-variant": "#6d3a00",
                "on-tertiary-fixed": "#2e1500",
                "outline": "#9c7e7a",
                "on-secondary": "#24351a",
                "surface-container-low": "#1c1b1b",
                "surface-container": "#201f1f",
                "on-primary-fixed": "#3a1a1a",
                "surface-container-lowest": "#0e0e0e",
                "primary-fixed-dim": "#991b1b",
                "tertiary-fixed-dim": "#ffb77b",
                "tertiary-container": "#c8803f",
                "background": "#131313",
                "on-background": "#e5e2e1",
                "primary-fixed": "#b84c4c",
                "secondary-container": "#3a4c2f",
                "surface-container-high": "#2a2a2a",
                "error": "#d49a9a",
                "inverse-surface": "#e5e2e1",
                "outline-variant": "#5f3a38",
                "secondary-fixed-dim": "#b8cda8",
                "primary": "#991b1b",
                "on-primary": "#ffffff",
                "on-error": "#5a1a1a",
                "surface-variant": "#353534",
                "tertiary": "#ffb77b",
                "on-surface": "#e5e2e1",
                "surface-tint": "#991b1b",
                "surface-dim": "#131313",
                "inverse-on-surface": "#313030",
                "secondary-fixed": "#d4e9c2",
                "on-error-container": "#ffdad6",
                "on-tertiary": "#4d2700",
                "tertiary-fixed": "#ffdcc2",
                "on-secondary-fixed-variant": "#3a4c2f",
                "surface": "#131313",
                "secondary": "#b8cda8",
                "on-primary-container": "#ffffff",
                "on-secondary-container": "#a7bb97",
                "on-tertiary-container": "#432100",
                "primary-container": "#6a1d1d",
                "surface-container-highest": "#353534",
                "on-surface-variant": "#b84c4c",
                "error-container": "#5a1a1a",
                "surface-bright": "#3a3939",
                "on-secondary-fixed": "#101f07"
            },
            "borderRadius": {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            },
            "spacing": {
                "gutter": "24px",
                "unit": "8px",
                "container-max": "1280px",
                "section-padding": "120px",
                "margin-safe": "40px"
            },
            "fontFamily": {
                "body-lg": ["Inter"],
                "headline-lg": ["Inter"],
                "headline-xl": ["Inter"],
                "headline-md": ["Inter"],
                "label-caps": ["Space Grotesk"],
                "body-md": ["Inter"]
            },
            "fontSize": {
                "body-lg": ["18px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }],
                "headline-lg": ["48px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                "headline-xl": ["80px", { "lineHeight": "1.1", "letterSpacing": "-0.04em", "fontWeight": "700" }],
                "headline-md": ["24px", { "lineHeight": "1.4", "letterSpacing": "0em", "fontWeight": "600" }],
                "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.15em", "fontWeight": "500" }],
                "body-md": ["15px", { "lineHeight": "1.6", "letterSpacing": "0em", "fontWeight": "400" }]
            }
        }
    }
};
