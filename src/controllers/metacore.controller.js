const MetacorePackage = require('../packages/metacore.package');

exports.initial = async (req, res)  => {
    const metacore = new MetacorePackage();

    let plan = await metacore.getPlan();

    console.log(plan);

    res.send('done');
}