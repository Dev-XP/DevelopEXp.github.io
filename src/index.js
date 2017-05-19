import _ from 'lodash';
import minimist from 'minimist';
import inquirer from 'inquirer';
import { Observable } from 'rxjs';

const discoverSubCommand = stream => stream
    .map(args => ({
        command: args._[0] || '',
        params: _.extend(args, {
            _: args._.slice(1),
        }),
    }));

Observable
    .of(process.argv.slice(2))
    .map(minimist)
    .let(discoverSubCommand)
    .subscribe(console.log);

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
