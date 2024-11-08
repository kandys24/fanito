const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Execute the query to create the "company" table
    db.query(`
            CREATE TABLE IF NOT EXISTS company (
                cid INT AUTO_INCREMENT PRIMARY KEY,
                cname VARCHAR(255) NOT NULL,
                cemail VARCHAR(191) NOT NULL UNIQUE,
                cphone VARCHAR(20) NOT NULL,
                cstatus ENUM('active', 'inactive', 'suspended') DEFAULT 'inactive',
                activation_token VARCHAR(191) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `, (err, result) => {
                if (err) {
                    console.error('Error creating company table:', err);
                    return;
                }
                // console.log('Company table created or already exists');
                // deleteTableCompany();
        }
    );

    // Execute the query to create the "companyDetails" table with a foreign key
    db.query(`
            CREATE TABLE IF NOT EXISTS companyDetails (
                cid INT PRIMARY KEY,
                companyName VARCHAR(255) NOT NULL,
                taxpayerNumber VARCHAR(100) NOT NULL,
                address VARCHAR(255) NOT NULL,
                vatScheme VARCHAR(100) NOT NULL,
                email VARCHAR(191) NOT NULL UNIQUE,
                website VARCHAR(191),
                phone VARCHAR(20) NOT NULL,
                fax VARCHAR(20),
                city VARCHAR(100) NOT NULL,
                imgUrl VARCHAR(255),
                FOREIGN KEY (cid) REFERENCES company(cid)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            );
        `, (err, result) => {
                if (err) {
                    console.error('Error creating companyDetails table:', err);
                    return;
                }
                // console.log('companyDetails table created or already exists');
                // deleteTableCompanyDetails();
        }
    );

    // Execute the query to create the "users" table
    db.query(`
            CREATE TABLE IF NOT EXISTS users (
                uid INT AUTO_INCREMENT PRIMARY KEY,
                cid INT NOT NULL,
                uemail VARCHAR(191) NOT NULL UNIQUE,
                urole ENUM('admin', 'collab', 'seller') DEFAULT 'admin',
                upassword VARCHAR(255) NOT NULL,
                ustatus ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cid) REFERENCES company(cid)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            );
        `, (err, result) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    return;
                }
                // console.log('Users table created or already exists');
                // deleteTableUsers();
        }
    );

    // Execute the query to create the "bankAccounts" table
    db.query(`
        CREATE TABLE IF NOT EXISTS bankAccounts (
            account_id INT AUTO_INCREMENT PRIMARY KEY,
            cid INT NOT NULL,
            bankName VARCHAR(100) NOT NULL,
            accountNumber VARCHAR(100) NOT NULL,
            iban VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
            if (err) {
                console.error('Error creating bankAccounts table:', err);
                return;
            }
            // console.log('bankAccounts table created or already exists');
            // deleteTablebankAccounts();
        }
    );

    // Execute the query to create the "docCustomization" table
    db.query(`
        CREATE TABLE IF NOT EXISTS doccustomization (
            cid INT PRIMARY KEY,
            logoUrl VARCHAR(255),
            observations TEXT,
            footer TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
            if (err) {
                console.error('Error creating documentCustomization table:', err);
                return;
            }
            // console.log('docCustomization table created or already exists');
            // deleteTableDoc();
        }
    );

    // Execute the query to create the "mytaxes" table
    db.query(`
        CREATE TABLE IF NOT EXISTS mytaxes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cid INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            default_value INT DEFAULT 0,
            value DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating mytaxes table:', err);
            return;
        }
        // console.log('mytaxes table created or already exists');
    });

    // Execute the query to create the "myseries" table
    db.query(`
        CREATE TABLE IF NOT EXISTS myseries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cid INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            default_value INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating myseries table:', err);
            return;
        }
        // console.log('myseries table created or already exists');
    });

    // Execute the query to create the "accountPlans" table
    db.query(`
        CREATE TABLE IF NOT EXISTS accountPlans (
            plan_id INT AUTO_INCREMENT PRIMARY KEY,
            cid INT NOT NULL,
            plan_name ENUM('BASIC', 'PLUS', 'PREMIUM') NOT NULL,
            plan_cost DECIMAL(10, 2) NOT NULL,
            billing_period ENUM('monthly', 'quarterly', 'yearly') DEFAULT 'quarterly',
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            document_limit INT NOT NULL,
            document_count INT DEFAULT 0,
            user_limit INT NOT NULL,
            user_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating accountPlans table:', err);
            return;
        }
        // console.log('accountPlans table created or already exists');
    });

    // Execute the query to create the "items" table with additional columns
    db.query(`
        CREATE TABLE IF NOT EXISTS items (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            cid INT NOT NULL,
            code VARCHAR(100) UNIQUE,
            description VARCHAR(255) NOT NULL,
            unit ENUM('Unidade', 'Serviço') NOT NULL,
            retention ENUM('Não Aplicar', 'Aplicar') DEFAULT 'Não Aplicar',
            unit_price DECIMAL(10, 2) NOT NULL,
            tax_rate DECIMAL(5, 2) NOT NULL,
            exemption_reason VARCHAR(255),
            pvp DECIMAL(10, 2),
            quantity INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('active', 'inactive') DEFAULT 'active',
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating items table:', err);
            return;
        }
        // console.log('Items table created or already exists');
        // deleteTableItems();
    });        

    db.query(`
        CREATE TABLE IF NOT EXISTS stock (
            stock_id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            units_in_stock INT NOT NULL,
            change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            QuantityChange INT NOT NULL,
            FOREIGN KEY (item_id) REFERENCES items(item_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err) => {
        if (err) {
            console.error('Error creating stock:', err.message);
            return;
        }
        // db.all(`SELECT * FROM Stock`, (err, row) => {
        //     if (err) {
        //         console.error('Error deleting table Stock:', err.message);
        //     } else {
        //         console.log(row);
        //     }
        // });
        // const ProductID = 'undefined'; // Replace this with the dynamic value
        // db.run(`DELETE FROM Stock WHERE ProductID = ?`, [ProductID], (err) => {
        //     if (err) {
        //         console.error('Error DELETE Stock:', err.message);
        //     } else {
        //         console.log('Stock deleted successfully');
        //     }
        // });
        // let UnitsInStock = 140, id = 8
        // db.run(`UPDATE Stock SET UnitsInStock = ? WHERE StockID = ?`, [UnitsInStock, id], (err) => {
        //     if (err) {
        //         console.error('Error UPDATE Stock:', err.message);
        //     } else {
        //         console.log('Stock UPDATE successfully');
        //     }
        // });
    });

    // Execute the query to create the "clientData" table
    db.query(`
        CREATE TABLE IF NOT EXISTS clientData (
            client_id INT AUTO_INCREMENT PRIMARY KEY,
            cid INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            type ENUM('Normal', 'Autofacturação') DEFAULT 'Normal',
            document_type VARCHAR(100) DEFAULT 'Contribuinte',
            document_number VARCHAR(100) NOT NULL,
            address VARCHAR(255) NOT NULL,
            postal_box VARCHAR(100),
            country VARCHAR(100) DEFAULT 'Angola',
            city VARCHAR(100) DEFAULT 'Luanda',
            email VARCHAR(191) NOT NULL UNIQUE,
            phone VARCHAR(20) NOT NULL,
            mobile VARCHAR(20),
            fax VARCHAR(20),
            website VARCHAR(191),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating clientData table:', err);
            return;
        }
        // console.log('clientData table created or already exists');
    });

    // Execute the query to create the "billingPreferences" table
    db.query(`
        CREATE TABLE IF NOT EXISTS billingPreferences (
            client_id INT PRIMARY KEY,
            cid INT NOT NULL,
            copies ENUM('Original', 'Em Duplicado', 'Em Triplicado') DEFAULT 'Original',
            payment_due ENUM('Pronto Pagamento', '15 Dias', '30 Dias', '45 Dias', '60 Dias', '90 Dias') DEFAULT 'Pronto Pagamento',
            language ENUM('Português', 'English') DEFAULT 'English',
            payment_method ENUM('Numerário', 'Transferência Bancária', 'Dinheiro electrónico') DEFAULT 'Numerário',
            observations TEXT,
            currency ENUM('Angolan kwanza (AOA)', 'Chinese yuan (CNY)', 'Euro (EUR)', 'United States dollar (USD)') DEFAULT 'Angolan kwanza (AOA)',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clientData(client_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (cid) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating billingPreferences table:', err);
            return;
        }
        // console.log('billingPreferences table created or already exists');
    });
    
    // Create "invoices" table
    db.query(`
        CREATE TABLE IF NOT EXISTS invoices (
            invoice_id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_code VARCHAR(100) UNIQUE,
            company_id INT NOT NULL,
            client_id INT NOT NULL,
            document_type VARCHAR(100) NOT NULL DEFAULT 'Proforma',
            document_style ENUM('A4', 'Thermal') NOT NULL DEFAULT 'A4',
            document_date DATE NOT NULL,
            due_date VARCHAR(50),
            payment_method VARCHAR(100),
            series VARCHAR(50),
            remarks TEXT,
            retention_percentage DECIMAL(5,2),
            status ENUM('draft', 'final', 'canceled') NOT NULL DEFAULT 'draft',
            total_amount DECIMAL(18,2) NOT NULL,
            retention_amount DECIMAL(18,2),
            taxable_amount DECIMAL(18,2),
            tax_amount DECIMAL(18,2),
            refcode VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating Invoices table:', err);
            return;
        }
        // console.log('Invoices table created or already exists');
    });

    // Create "invoiceclients" table
    db.query(`
        CREATE TABLE IF NOT EXISTS invoiceclients (
            client_id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT NOT NULL,
            clid_id INT NOT NULL,
            client_name VARCHAR(255) NOT NULL,
            client_tax_id VARCHAR(50),
            client_email VARCHAR(255),
            client_address TEXT,
            client_po_box VARCHAR(50),
            client_city VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (invoice_id) REFERENCES Invoices(invoice_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
            );
    `, (err, result) => {
        if (err) {
            console.error('Error creating invoiceclients table:', err);
            return;
        }
        // console.log('invoiceclients table created or already exists');
    });

    // Create "invoiceitems" table
    db.query(`
        CREATE TABLE IF NOT EXISTS invoiceitems (
            item_id INT AUTO_INCREMENT PRIMARY KEY,
            invoice_id INT NOT NULL,
            itid INT NOT NULL,
            item_code VARCHAR(50),
            description VARCHAR(255),
            unit_price DECIMAL(18,2),
            quantity INT NOT NULL,
            discount_amount DECIMAL(18,2),
            tax_rate DECIMAL(5,2),
            exemption_reason VARCHAR(255),
            total_price DECIMAL(18,2),
            FOREIGN KEY (invoice_id) REFERENCES Invoices(invoice_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
            );
    `, (err, result) => {
        if (err) {
            console.error('Error creating InvoiceItems table:', err);
            return;
        }
        // console.log('InvoiceItems table created or already exists');
    });

    // Create "receipts" table
    db.query(`
        CREATE TABLE IF NOT EXISTS receipts (
            receipt_id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            receipt_code VARCHAR(100) UNIQUE,
            invoice_id INT NOT NULL,
            document_type VARCHAR(100) NOT NULL DEFAULT 'Receipt',
            document_date DATE NOT NULL,
            payment_method VARCHAR(100),
            series VARCHAR(50),
            status ENUM('final', 'canceled') NOT NULL DEFAULT 'final',
            paid DECIMAL(18,2) NOT NULL,
            obs VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES company(cid),
            FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating receipts table:', err);
            return;
        }
        // console.log('receipts table created or already exists');
        // deleteTableReceipts()
    });

    // Create "cancellations" table
    db.query(`
        CREATE TABLE IF NOT EXISTS cancellations (
            cancellation_id INT AUTO_INCREMENT PRIMARY KEY,
            company_id INT NOT NULL,
            doc_code VARCHAR(100) UNIQUE NOT NULL,
            document_type VARCHAR(100) NOT NULL,
            cancellation_reason VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating cancellations table:', err);
            return;
        }
        // console.log('cancellations table created or already exists');
    });

    // Create "expenses" table
    db.query(`
        CREATE TABLE IF NOT EXISTS expenses (
            expense_id INT AUTO_INCREMENT PRIMARY KEY,
            expense_code VARCHAR(100) UNIQUE,
            company_id INT NOT NULL,
            document_type VARCHAR(100) NOT NULL DEFAULT 'Expense',
            document_date DATE NOT NULL,
            payment_method VARCHAR(100),
            description VARCHAR(255),
            status ENUM('final', 'canceled') NOT NULL DEFAULT 'final',
            amount DECIMAL(18,2) NOT NULL,
            obs VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES company(cid)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `, (err, result) => {
        if (err) {
            console.error('Error creating expenses table:', err);
            return;
        }
        // console.log('expenses table created or already exists');
    });
    
});

const deleteTableCompany = () =>{

    // SQL statement to delete table if it exists
    db.query(`DROP TABLE IF EXISTS company;`, (err, result) => {
        if (err) {
            console.error('Error dropping company table:', err);
            return;
        }
        console.log('company table dropped or did not exist');
    });
}

const deleteTableUsers = () =>{
    // SQL statement to delete table if it exists

    db.query(`DROP TABLE IF EXISTS users;`, (err, result) => {
        if (err) {
            console.error('Error dropping users table:', err);
            return;
        }
        console.log('Users table dropped or did not exist');
    });
}


const deleteTableCompanyDetails = () => {
    // SQL statement to delete table if it exists
    db.query(`DROP TABLE IF EXISTS companyDetails;`, (err, result) => {
        if (err) {
            console.error('Error dropping companyDetails table:', err);
            return;
        }
        console.log('companyDetails table dropped or did not exist');
    });
}

const deleteTableDoc = () => {
    // SQL statement to delete table if it exists
    db.query(`DROP TABLE IF EXISTS doccustomization;`, (err, result) => {
        if (err) {
            console.error('Error dropping doccustomization table:', err);
            return;
        }
        console.log('doccustomization table dropped or did not exist');
    });
}

const deleteTablebankAccounts = () =>{
    // SQL statement to delete table if it exists
    db.query(`DROP TABLE IF EXISTS bankAccounts;`, (err, result) => {
        if (err) {
            console.error('Error dropping bankAccounts table:', err);
            return;
        }
        console.log('bankAccounts table dropped or did not exist');
    });
}

const deleteTableMyTaxes = () => {
    db.query(`DROP TABLE IF EXISTS mytaxes;`, (err, result) => {
        if (err) {
            console.error('Error dropping mytaxes table:', err);
            return;
        }
        console.log('mytaxes table dropped or did not exist');
    });
};

const deleteTableItems = () => {
    db.query(`DROP TABLE IF EXISTS items;`, (err, result) => {
        if (err) {
            console.error('Error dropping items table:', err);
            return;
        }
        console.log('items table dropped or did not exist');
    });
};

const deleteTableReceipts = () => {
    db.query(`DROP TABLE IF EXISTS receipts;`, (err, result) => {
        if (err) {
            console.error('Error dropping items receipts:', err);
            return;
        }
        console.log('receipts table dropped or did not exist');
    });
};

module.exports = db;