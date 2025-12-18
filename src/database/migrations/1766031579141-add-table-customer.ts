import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableCustomer1766031579141 implements MigrationInterface {
  name = 'AddTableCustomer1766031579141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`customer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`address\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order\` ADD CONSTRAINT \`FK_cd7812c96209c5bdd48a6b858b0\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // create two sample customers
    await queryRunner.query(
      `INSERT INTO \`customer\` (\`name\`, \`email\`, \`phone\`, \`address\`, \`created_at\`, \`updated_at\`) VALUES 
      ('John Doe', 'john.doe@example.com', '123-456-7890', '123 Main St', NOW(), NOW()),
      ('Jane Smith', 'jane.smith@example.com', '987-654-3210', '456 Elm St', NOW(), NOW())`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order\` DROP FOREIGN KEY \`FK_cd7812c96209c5bdd48a6b858b0\``,
    );
    await queryRunner.query(`DROP TABLE \`customer\``);
  }
}
