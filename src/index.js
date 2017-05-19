import inquirer from 'inquirer';

const blogPrompts = [
    {
        name: 'post',
        message: 'Write the blog post...',
        type: 'editor',
    },
    {
        name: 'name',
        message: 'What is the name of this post?',
        type: 'input',
    },
    {
        name: 'publish',
        message: 'Would you like to publish this post?',
        type: 'confirm',
        default: false,
    },
];

inquirer
    .prompt(blogPrompts)
    .then(console.log)
