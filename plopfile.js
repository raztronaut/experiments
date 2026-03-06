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
        ],
        default: "blank",
      },
    ],
    actions(answers) {
      const profileDir = `plop-templates/experiment/profiles/${answers.profile}`;

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
              created: new Date().toISOString(),
              profile: "{{profile}}",
              status: "wip",
              tags: [],
              tech: [],
              image: "/experiments/{{dashCase name}}/preview.gif",
              video: "",
              poster: "/experiments/{{dashCase name}}/poster.jpg",
              isPlaceholder: true,
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
        (answers) => {
          const fs = require("node:fs");
          const path = require("node:path");
          const dashCase = plop.getHelper("dashCase");
          const slug = dashCase(answers.name);
          const src = path.join(
            process.cwd(),
            "public/experiments/no-preview.gif"
          );
          const dest = path.join(
            process.cwd(),
            "public/experiments",
            slug,
            "preview.gif"
          );

          try {
            fs.copyFileSync(src, dest);
            return "Copied default preview.gif";
          } catch (e) {
            return `Failed to copy preview.gif: ${e.message}`;
          }
        },
        {
          type: "add",
          path: "src/components/experiments/{{dashCase name}}/{{pascalCase name}}.tsx",
          templateFile: `${profileDir}/component.tsx.hbs`,
        },
        {
          type: "add",
          path: "src/components/experiments/{{dashCase name}}/{{pascalCase name}}.stories.tsx",
          templateFile: "plop-templates/experiment/component.stories.tsx.hbs",
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
      ];
    },
  });
};
