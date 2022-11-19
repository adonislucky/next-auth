module.exports = {
  docs: [
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "getting-started/introduction",
        "getting-started/example",
        "getting-started/client",
        "getting-started/rest-api",
        "getting-started/typescript",
        "getting-started/upgrade-v4",
      ],
    },
    {
      type: "category",
      label: "Configuration",
      collapsed: true,
      items: [
        "configuration/initialization",
        "configuration/options",
        {
          type: "category",
          label: "Providers",
          collapsed: true,
          items: [
            "configuration/providers/oauth",
            "configuration/providers/email",
            "configuration/providers/credentials",
          ],
        },
        "configuration/databases",
        "configuration/pages",
        "configuration/callbacks",
        "configuration/events",
        "configuration/nextjs",
      ],
    },
    {
      type: "category",
      label: "Providers",
      link: { type: "doc", id: "providers/overview" },
      collapsed: true,
      items: [
        {
          type: "autogenerated",
          dirName: "providers",
        },
      ],
    },
    {
      type: "category",
      label: "Adapters",
      link: { type: "doc", id: "adapters/overview" },
      collapsed: true,
      items: [
        "adapters/models",
        "adapters/prisma",
        "adapters/fauna",
        "adapters/dynamodb",
        "adapters/firebase",
        "adapters/pouchdb",
        "adapters/mongodb",
        "adapters/neo4j",
        "adapters/typeorm",
        "adapters/sequelize",
        "adapters/supabase",
        "adapters/mikro-orm",
        "adapters/dgraph",
        "adapters/upstash-redis",
      ],
    },
    "warnings",
    "errors",
    "deployment",
    {
      type: "category",
      label: "Guides",
      link: { type: "doc", id: "guides/guides" },
      collapsed: true,
      items: ["guides/basics", "guides/fullstack", "guides/testing"],
    },
    {
      type: "html",
      value:
        '<script async type="text/javascript" src="//cdn.carbonads.com/carbon.js?serve=CEAI6K3N&placement=next-authjsorg" id="_carbonads_js"></script>',
      defaultStyle: true,
    },
  ],
}
