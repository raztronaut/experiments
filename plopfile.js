module.exports = function (plop) {
    plop.setGenerator('experiment', {
        description: 'Create a new isolated experiment',
        prompts: [
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of your experiment?',
                validate: (value) => {
                    if (/.+/.test(value)) {
                        return true;
                    }
                    return 'name is required';
                },
            },
            {
                type: 'input',
                name: 'description',
                message: 'Short description (optional):',
            },
        ],
        actions: function () {
            const actions = [
                // 1. Create Route Group Layout (Isolated Environment)
                {
                    type: 'add',
                    path: 'src/app/experiments/({{dashCase name}})/layout.tsx',
                    templateFile: 'plop-templates/experiment/route-layout.tsx.hbs',
                },
                // 2. Create Route Page
                {
                    type: 'add',
                    path: 'src/app/experiments/({{dashCase name}})/{{dashCase name}}/page.tsx',
                    templateFile: 'plop-templates/experiment/route-page.tsx.hbs',
                },
                // 3. Create Route Error Boundary
                {
                    type: 'add',
                    path: 'src/app/experiments/({{dashCase name}})/{{dashCase name}}/error.tsx',
                    templateFile: 'plop-templates/experiment/route-error.tsx.hbs',
                },
                // 4. Create Metadata File
                {
                    type: 'add',
                    path: 'src/app/experiments/({{dashCase name}})/experiment.json',
                    template: JSON.stringify({
                        title: '{{titleCase name}}',
                        description: '{{description}}',
                        slug: '{{dashCase name}}',
                        created: new Date().toISOString(),
                        image: '/experiments/{{dashCase name}}/preview.gif',
                        isPlaceholder: true,
                    }, null, 2),
                },
                // 5. Create Public Assets Folder
                {
                    type: 'add',
                    path: 'public/experiments/{{dashCase name}}/.gitkeep',
                    template: '',
                },
                // 5.5 Copy Default Preview GIF
                function (answers) {
                    const fs = require('fs');
                    const path = require('path');
                    const dashCase = plop.getHelper('dashCase');
                    const slug = dashCase(answers.name);
                    const src = path.join(process.cwd(), 'public/experiments/no-preview.gif');
                    const dest = path.join(process.cwd(), 'public/experiments', slug, 'preview.gif');

                    try {
                        fs.copyFileSync(src, dest);
                        return 'Copied default preview.gif';
                    } catch (e) {
                        return `Failed to copy preview.gif: ${e.message}`;
                    }
                },
                // 6. Create Main Component
                {
                    type: 'add',
                    path: 'src/components/experiments/{{dashCase name}}/{{pascalCase name}}.tsx',
                    templateFile: 'plop-templates/experiment/component.tsx.hbs',
                },
                // 7. Create Component Story
                {
                    type: 'add',
                    path: 'src/components/experiments/{{dashCase name}}/{{pascalCase name}}.stories.tsx',
                    templateFile: 'plop-templates/experiment/component.stories.tsx.hbs',
                },
                // 8. Create Component Test
                {
                    type: 'add',
                    path: 'src/components/experiments/{{dashCase name}}/{{pascalCase name}}.test.tsx',
                    templateFile: 'plop-templates/experiment/component.test.tsx.hbs',
                }
            ];

            return actions;
        },
    });
};
