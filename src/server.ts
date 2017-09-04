import * as pdf from 'html-pdf';
import * as fs from 'fs';
import * as express from "express";
import * as mustache from 'mustache';
import * as process from 'process';

const config = require('../config.json');
const app: express.Express = express();

function renderField(params: Map<string, string>, key: string, render: (string) => string, enterable?: boolean) {
    let value: string;
    if (params[key]) {
        value = render(params[key]);
    } else if (config.formDefaults[key]) {
        value = render(config.formDefaults[key]);
    } else {
        value = render(key);
    }
    return "<a contenteditable "
            + ((!enterable)? "class=\"disable-enter\"" : "")
            + " id=\"" + render(key) + "\">"
            + value
        + "</a>";
}

function renderHtml(params: any): Promise<string> {
    return new Promise<string>((res: (string) => void) => {
        fs.readFile(config.formHtml, (err: NodeJS.ErrnoException, data: Buffer) => {
            if (err) {
                console.error(err);
                return;
            }

            let template: string = data.toString('utf8');

            params.field = () => {
                return (key: string, render: (string) => string) => {
                    return renderField(params, key, render, false);
                };
            };

            params.efield = () => {
                return (key: string, render: (string) => string) => {
                    return renderField(params, key, render, true);
                };
            };

            res(mustache.render(template, params));
        });
    });
}

app.get('/', (req: express.Request, res: express.Response) => {
    renderHtml(req.query).then((html: string) => {
        res.send(html);
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });
});

app.get('/pdf', (req: express.Request, res: express.Response) => {
    renderHtml(req.query).then((html: string) => {
        let template = html.replace(/<script[\s\S]*<\/script>/gi, '');
        pdf.create(template).toStream((err, stream) => {
            if (!stream) {
                res.status(500).send(err.toString());
                return;
            }
            stream.pipe(res);
        });
    }).catch((err) => {
        console.error(err);
        res.status(500).send(err);
    });
});

app.listen(8080, function() {
    console.log('Started listening');
});

process.on('SIGINT', function() {
    console.log('Exiting server...');
    process.exit();
});