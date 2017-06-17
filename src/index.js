import _ from 'lodash';
import Vinyl from 'vinyl';
import vfs from 'vinyl-fs';
import minimist from 'minimist';
import inquirer from 'inquirer';
import { Observable, Subject } from 'rxjs';
import discoverSubCommand from '@devex/discover-subcommand';

const convertToFile = stream => stream
    .map(data => (new Vinyl({
        base: `./${data.publish ? 'posts' : 'drafts'}/`,
        path: `./${data.publish ? 'posts' : 'drafts'}/${data.name}.json`,
        contents: new Buffer(JSON.stringify(data, null, 4)),
    })));

const prompts = {
    blog: [
        {
            name: 'post',
            message: 'Write the blog post...',
            type: 'input',
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
    ],
};

const blogService = request => Observable
    .of(request)
    .filter(service => service.command === 'blog')
    .map(service => ({
        sideEffects: [
            { prompts: prompts.blog },
        ],
    }));

const handlePrompts = response => Observable
    .of(response)
    .filter(r => r.prompts)
    .map(r => r.prompts)
    .mergeMap(prompts => Observable
        .fromPromise(inquirer.prompt(prompts))
    );

const handleSideEffects = response => Observable
    .of(response)
    .filter(r => r.sideEffects)
    .concatMap(r => r.sideEffects)
    .mergeMap(sideEffect => Observable
        .merge(
            handlePrompts(sideEffect),
        )
    )
    .do(console.log);

const parser = new Subject();
parser
    .map(minimist)
    .let(discoverSubCommand)
    .mergeMap(request => Observable
        .merge(
            blogService(request)
        )
    )
    .mergeMap(handleSideEffects)
    .let(convertToFile)
    .subscribe(file => {
        vfs.dest(file.dirname).write(file, 'utf-8');
    });

parser.next(process.argv.slice(2));
