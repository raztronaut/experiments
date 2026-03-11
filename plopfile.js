module.exports = (plop) => {
  plop.setGenerator("experiment", {
    description: "Create a new isolated experiment",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of your experiment?",
        validate: (value) => {
          if (/.+/.test(value)) {
            return true;
          }
          return "name is required";
        },
      },
      {
        type: "input",
        name: "description",
        message: "Short description (optional):",
      },
      {
        type: "list",
        name: "complexity",
        message: "Complexity level:",
        choices: [
          { name: "Beginner (single-technique, minimal)", value: "beginner" },
          {
            name: "Intermediate (interaction/dom-effect, single-shader)",
            value: "intermediate",
          },
          {
            name: "Advanced (multi-technique, R3F, physics)",
            value: "advanced",
          },
        ],
        default: "intermediate",
      },
      {
        type: "list",
        name: "profile",
        message: "Experiment profile:",
        choices: [
          { name: "Blank (minimal shell)", value: "blank" },
          { name: "R3F Scene (3D with Three.js)", value: "r3f-scene" },
          { name: "R3F Shader (custom shaders)", value: "r3f-shader" },
          {
            name: "Scrollytelling (Lenis + GSAP ScrollTrigger)",
            value: "scrollytelling",
          },
          { name: "Interaction (Motion + gestures)", value: "interaction" },
          { name: "Web Audio (AudioContext + synthesis)", value: "web-audio" },
          {
            name: "DOM Effect (CSS/shader effects on DOM)",
            value: "dom-effect",
          },
          {
            name: "Mixed (scroll + 3D + interaction)",
            value: "mixed",
          },
        ],
        default: "blank",
      },
      {
        type: "confirm",
        name: "includeToolkit",
        message: "Include toolkit wiring? (Lenis + Tempus + GSAP unified RAF)",
        default: (answers) =>
          ["scrollytelling", "r3f-scene", "r3f-shader", "mixed"].includes(
            answers.profile
          ),
        when: (answers) => answers.profile !== "blank",
      },
      {
        type: "confirm",
        name: "includeLeva",
        message: "Include leva debug GUI?",
        default: false,
        when: (answers) => answers.profile !== "blank",
      },
    ],
    actions(answers) {
      const profileDir = `plop-templates/experiment/profiles/${answers.profile}`;
      answers.createdDate = new Date().toISOString();
      answers.includeToolkit = answers.includeToolkit ?? false;
      answers.includeLeva = answers.includeLeva ?? false;

      const actions = [
        {
          type: "add",
          path: "src/app/experiments/({{dashCase name}})/layout.tsx",
          templateFile: "plop-templates/experiment/route-layout.tsx.hbs",
        },
        {
          type: "add",
          path: "src/app/experiments/({{dashCase name}})/{{dashCase name}}/page.tsx",
          templateFile: `${profileDir}/route-page.tsx.hbs`,
        },
        {
          type: "add",
          path: "src/app/experiments/({{dashCase name}})/{{dashCase name}}/error.tsx",
          templateFile: "plop-templates/experiment/route-error.tsx.hbs",
        },
        {
          type: "add",
          path: "src/app/experiments/({{dashCase name}})/experiment.json",
          template: `${JSON.stringify(
            {
              title: "{{titleCase name}}",
              description: "{{description}}",
              slug: "{{dashCase name}}",
              created: "{{createdDate}}",
              profile: "{{profile}}",
              status: "wip",
              complexity: "{{complexity}}",
              tags: [],
              tech: [],
              image: "",
              video: "",
              poster: "/experiments/{{dashCase name}}/poster.jpg",
              publishable: false,
            },
            null,
            2
          )}\n`,
        },
        {
          type: "add",
          path: "public/experiments/{{dashCase name}}/.gitkeep",
          template: "",
        },
        {
          type: "add",
          path: "src/components/experiments/{{dashCase name}}/{{pascalCase name}}.tsx",
          templateFile: `${profileDir}/component.tsx.hbs`,
        },
        {
          type: "add",
          path: "src/components/experiments/{{dashCase name}}/{{pascalCase name}}.test.tsx",
          templateFile: "plop-templates/experiment/component.test.tsx.hbs",
        },
      ];

      return actions;
    },
  });

  plop.setGenerator("collected", {
    description: "Scaffold a collected component (ported external demo)",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
        validate: (value) => {
          if (!/.+/.test(value)) {
            return "name is required";
          }
          const fs = require("node:fs");
          const dashCase = plop.getHelper("dashCase");
          const slug = dashCase(value);
          const dir = `src/components/collected/${slug}`;
          if (fs.existsSync(dir)) {
            return `Component already exists at ${dir}.`;
          }
          return true;
        },
      },
      {
        type: "input",
        name: "source",
        message: "Source URL (GitHub repo or demo URL):",
        validate: (value) =>
          /.+/.test(value) ? true : "source URL is required",
      },
      {
        type: "input",
        name: "author",
        message: "Original author:",
        validate: (value) => (/.+/.test(value) ? true : "author is required"),
      },
      {
        type: "input",
        name: "license",
        message: "License:",
        default: "MIT",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/components/collected/{{dashCase name}}/{{pascalCase name}}.tsx",
        templateFile: "plop-templates/collected/component.tsx.hbs",
      },
      {
        type: "add",
        path: "src/components/collected/{{dashCase name}}/meta.json",
        templateFile: "plop-templates/collected/meta.json.hbs",
      },
      {
        type: "add",
        path: "src/components/collected/{{dashCase name}}/styles.css",
        templateFile: "plop-templates/collected/styles.css.hbs",
      },
    ],
  });

  plop.setGenerator("article", {
    description: "Create article + docs for an existing experiment",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Experiment name (must match existing experiment):",
        validate: (value) => {
          if (!/.+/.test(value)) {
            return "name is required";
          }
          const fs = require("node:fs");
          const dashCase = plop.getHelper("dashCase");
          const slug = dashCase(value);
          const routeDir = `src/app/experiments/(${slug})`;
          if (!fs.existsSync(routeDir)) {
            return `No experiment found at ${routeDir}. Create the experiment first with 'npm run new:experiment'.`;
          }
          const articlePath = `${routeDir}/${slug}/article/page.tsx`;
          if (fs.existsSync(articlePath)) {
            return `Article already exists for "${slug}". Delete it first with 'npm run delete:article ${slug}'.`;
          }
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Article description (optional, press Enter to skip):",
      },
    ],
    actions(answers) {
      const dashCase = plop.getHelper("dashCase");
      const slug = dashCase(answers.name);
      const routeBase = `src/app/experiments/(${slug})/${slug}`;
      answers.createdDate = new Date().toISOString().split("T")[0];
      answers.description = answers.description || "";

      return [
        {
          type: "add",
          path: `${routeBase}/article/page.tsx`,
          templateFile: "plop-templates/article/page.tsx.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/article/content.mdx`,
          templateFile: "plop-templates/article/content.mdx.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/article/components.tsx`,
          templateFile: "plop-templates/article/components.tsx.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/docs/lab-note.md`,
          templateFile: "plop-templates/article/lab-note.md.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/docs/architecture.md`,
          templateFile: "plop-templates/article/architecture.md.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/docs/snippet.md`,
          templateFile: "plop-templates/article/snippet.md.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/docs/social.md`,
          templateFile: "plop-templates/article/social.md.hbs",
        },
        {
          type: "add",
          path: `${routeBase}/docs/changelog.md`,
          templateFile: "plop-templates/article/changelog.md.hbs",
        },
        {
          type: "modify",
          path: `src/app/experiments/(${slug})/experiment.json`,
          transform(fileContent) {
            const data = JSON.parse(fileContent);
            data.content = { ...data.content, article: true };
            return `${JSON.stringify(data, null, 2)}\n`;
          },
        },
      ];
    },
  });
};
