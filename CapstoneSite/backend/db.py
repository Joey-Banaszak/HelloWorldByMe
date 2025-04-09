# import needed modules
import psycopg2
from psycopg2 import sql 

hostname = 'database-1.c9c60ay4es21.us-east-2.rds.amazonaws.com'
database = "database-1"
username = "postgres"
pwd = "H3ll0w0rld:3yme!2"
port_id = 5432

#############################
#ADD THE COMMAND TO A README# "pip install psycopg2" (Windows) or "pip3 install psycopg2" (mac)
#############################

# open the command
conn = psycopg2.connect( 
    host = hostname, 
    dbname = database,
    user = username, 
    password = pwd,
    port = port_id)

cursor = conn.cursor()

master_startup_script = '''CREATE TABLE IF NOT EXISTS master(
                     userName text PRIMARY KEY,
                     password text NOT NULL, 
                     role text SET DEFAULT 'user' )'''

audit_table_script = '''CREATE TABLE IF NOT EXISTS audit_table (

                        audit_id INT PRIMARY KEY AUTO_INCREMENT,

                        userName text,

                        operation VARCHAR(10),

                        old_user_name VARCHAR(255),

                        new_user_name VARCHAR(255),

                        old_role text),

                        new_role text,

                        audit_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                        FOREIGN KEY (userName) REFERENCES master(userName) );'''

trigger_script = '''CREATE TRIGGER update_audit

                    AFTER UPDATE ON __________

                    FOR EACH ROW

                    BEGIN

                        INSERT INTO audit_table (audit_id, userName, operation, old_user_name, new_user_name, old_role, new_role, audit_timestamp)

                        VALUES (OLD.audit_id, OLD.userName , "UPDATE", OLD.userName, NEW.userName, OLD.role, NEW.role, NOW());

                    END;'''

# query for finding a user in the database 
find_query = sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier(table_name))

# command for changing a value in the database 
update_query = sql.SQL("UPDATE {} SET email = %s WHERE id = %s").format(sql.Identifier(table_name))

# command for adding a value to the database 
insert_query = sql.SQL("INSERT INTO {} (email, password) VALUES (%s, %s)").format(sql.Identifier(table_name)) 

# command for removing a value from the database 
delete_query = sql.SQL("DELETE FROM {} WHERE id = %s").format(sql.Identifier(table_name))



cursor.execute( master_startup_script )

conn.commit()

# close the connection
cursor.close()
conn.close()

