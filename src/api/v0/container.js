const express = require('express');

const router = express();

const Docker = require('dockerode');
const config = require('../../config');
const logger = require('../../logger');
const validator = require('../../validator');

const docker = new Docker({
    host: config.DOCKER_HOST,
    port: config.DOCKER_PORT,
});

router.get('/get/:query', async (req, res, next) => {
    const queryString = req.params.query;
    if (queryString === 'all') {
        docker.listContainers({
            all: true,
        }, (err, containers) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json(containers);
            }
        });
    } else {
        const container = await docker.getContainer(queryString);
        if (container === null) {
            res.sendStatus(404)
            return
        }
        try {
            const data = await container.inspect();
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }
});

router.post('/create', async (req, res, next) => {
    const {
        name,
        image,
    } = req.body;

    docker.createContainer({
        name,
        Image: image,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        OpenStdin: false,
        StdinOnce: false,
    }).then((container) => container.start()).then((container) => {
        res.status(200).json(container);
    });
});

router.post('/stop', async (req, res, next) => {
    const {
        name,
    } = req.body;

    try {
        const containers = await docker.listContainers({
            all: true,
        });

        let containerID = '';

        for (container of containers) {
            if (container.Names[0] === `/${name}`) {
                containerID = container.Id;
                break;
            }
        }

        if (containerID === '') {
            res.status(404).json({
                err: 'container not found',
            });
            return;
        }

        const targetContainer = await docker.getContainer(containerID);

        await targetContainer.stop();

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.post('/remove', async (req, res, next) => {
    const {
        name,
    } = req.body;

    try {
        const containers = await docker.listContainers({
            all: true,
        });

        let containerID = '';

        for (container of containers) {
            if (container.Names[0] === `/${name}`) {
                containerID = container.Id;
                break;
            }
        }

        if (containerID === '') {
            res.status(404).json({
                err: 'container not found',
            });
            return;
        }

        const targetContainer = await docker.getContainer(containerID);

        await targetContainer.remove();

        res.sendStatus(200);
    } catch (err) {
        next(err);
    }
});

router.get('/logs/:name', async (req, res, next) => {
    const {
        name,
    } = req.params;

    try {
        const containers = await docker.listContainers({
            all: true,
        });

        let containerID = '';

        for (container of containers) {
            if (container.Names[0] === `/${name}`) {
                containerID = container.Id;
                break;
            }
        }

        if (containerID === '') {
            res.status(404).json({
                err: 'container not found',
            });
            return;
        }

        const targetContainer = await docker.getContainer(containerID);

        const logOpts = {
            stdout: true,
            stderr: true,
            tail: 100,
            follow: true,
        };

        targetContainer.logs(logOpts, (err, data) => {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
            });

            data.on('data', (chunk) => {
                res.write(chunk);
            });

            data.on('end', () => res.end());
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
