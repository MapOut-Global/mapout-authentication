const projects = [
    {
        name: 'mapout',
        apiKey: 'mapout-api-key',
    },
    {
        name: 'hrgig',
        apiKey: 'hrgig-api-key',
    },
];

const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'API key is required' });
    }

    const project = projects.find(proj => proj.apiKey === apiKey);

    if (!project) {
        return res.status(403).json({ message: 'Invalid API key' });
    }

    switch (project.name) {
        case 'mapout':
            req.redirectToMapout = true;
            break;
        case 'hrgig':
            req.redirectToHrgig = true;
            break;
        default:
            return res.status(403).json({ message: 'Invalid project' });
    }

    next(); 
};

module.exports = authMiddleware;