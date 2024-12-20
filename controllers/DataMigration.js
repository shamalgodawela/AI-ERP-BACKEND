const Invoice = require('../models/invoice'); // Source database
const TaxInvoice = require('../models/TaxInvoice'); // Target database

const migrateData = async (req, res) => {
    try {
        const startDate = new Date('2024-10-01'); 
        const endDate = new Date(); 

        // Fetch data from source collection using $expr and $dateFromString
        const dataToMigrate = await Invoice.aggregate([
            {
                $addFields: {
                    invoiceDateAsDate: {
                        $dateFromString: { dateString: "$invoiceDate", format: "%Y-%m-%d" }
                    }
                }
            },
            {
                $match: {
                    invoiceDateAsDate: { $gte: startDate, $lte: endDate }
                }
            }
        ]);

        if (dataToMigrate.length === 0) {
            return res.status(200).send('No data found within the specified date range.');
        }

        // Remove the temporary `invoiceDateAsDate` field before inserting
        const cleanedData = dataToMigrate.map(({ invoiceDateAsDate, ...rest }) => rest);

        await TaxInvoice.insertMany(cleanedData);

        res.status(200).send(`${cleanedData.length} documents copied successfully.`);
    } catch (error) {
        console.error('Error during migration:', error);
        res.status(500).send('Migration process failed.');
    }
};

module.exports = {
    migrateData,
};
