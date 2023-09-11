export default defineAppConfig({
  docus: {
    title: 'mion',
    description: 'Type Safe APIs at the speed of light 🚀',
    image: 'https://mion.io/banners/mion-website-banner-1-2.png',
    socials: {
      github: 'MionKit/mion',
      twitter: '@Ma_jrz',
    },
    github: {
      dir: 'docs/site',
      branch: 'main',
      repo: 'mion',
      owner: 'MionKit',
      edit: false
    },
    aside: {
      level: 0,
      collapsed: false,
      exclude: []
    },
    main: {
      padded: true,
      fluid: false
    },
    header: {
      padded: true,
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: false
    }
  }
})
