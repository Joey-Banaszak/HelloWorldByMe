import psycopg2
from psycopg2 import sql


#################################
#conn = psycopg2.connect(
#        dbname = "hello_WBM",
#        user = "postgres",
#        password = "H3ll0w0rld:3yme!2",
#        host = "database-1.c9c60ay4es21.us-east-2.rds.amazonaws.com",
#        port = 5432 )
#################################



def create_table_and_add_to_master(conn, table_name, owner_usr_name):
    try:
        with conn.cursor() as cursor:
            # Create a new table dynamically
            create_table_query = sql.SQL("""
                CREATE TABLE IF NOT EXISTS {} (
                    id SERIAL PRIMARY KEY,
                    name TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """).format(sql.Identifier(table_name))
            cursor.execute(create_table_query)
            
            # Add the table name to the "master" table
            insert_query = sql.SQL("""
                INSERT INTO master (owner_usr_name) VALUES (%s) RETURNING table_id;
            """)
            cursor.execute(insert_query, (owner_usr_name,))
            table_id = cursor.fetchone()[0]

            conn.commit()
            print(f"Table '{table_name}' created successfully, and added to 'master' with table_id {table_id}.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

def create_user(conn, user_name, email, phone_num, password, company):
    try:
        with conn.cursor() as cursor:
            # Insert a new user into the 'users' table
            insert_query = sql.SQL("""
                INSERT INTO users (user_name, email, phone_num, password, company)
                VALUES (%s, %s, %s, %s, %s);
            """)
            cursor.execute(insert_query, (user_name, email, phone_num, password, company))
            conn.commit()
            print(f"User '{user_name}' created successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

def edit_user(conn, user_id, user_name=None, email=None, phone_num=None, password=None, company=None):
    try:
        with conn.cursor() as cursor:
            update_fields = []
            update_values = []
            
            if user_name:
                update_fields.append("user_name = %s")
                update_values.append(user_name)
            if email:
                update_fields.append("email = %s")
                update_values.append(email)
            if phone_num:
                update_fields.append("phone_num = %s")
                update_values.append(phone_num)
            if password:
                update_fields.append("password = %s")
                update_values.append(password)
            if company:
                update_fields.append("company = %s")
                update_values.append(company)
            
            update_values.append(user_id)  # Last value is user_id for WHERE clause

            update_query = sql.SQL("""
                UPDATE users SET {} WHERE id = %s;
            """).format(sql.SQL(", ").join(map(sql.Identifier, update_fields)))
            
            cursor.execute(update_query, update_values)
            conn.commit()
            print(f"User with ID {user_id} updated successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

def get_user_by_id(conn, user_id):
    try:
        with conn.cursor() as cursor:
            select_query = sql.SQL("SELECT * FROM users WHERE id = %s;")
            cursor.execute(select_query, (user_id,))
            user = cursor.fetchone()
            return user
    except Exception as e:
        print(f"Error: {e}")
        return None

def delete_user(conn, user_id):
    try:
        with conn.cursor() as cursor:
            delete_query = sql.SQL("DELETE FROM users WHERE id = %s;")
            cursor.execute(delete_query, (user_id,))
            conn.commit()
            print(f"User with ID {user_id} deleted successfully.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")

def main():

    print("running main")

    conn = psycopg2.connect(
        dbname = "hello_WBM",
        user = "postgres",
        password = "H3ll0w0rld:3yme!2",
        host = "database-1.c9c60ay4es21.us-east-2.rds.amazonaws.com",
        port = 5432 )

    print("opening connection")

    create_user(conn, 'jane_doe', 'jane@example.com', 987654321 , 'password321', 1)

    print("closed connection")

main()
    
