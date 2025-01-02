# **Assessment: Software Engineer \- Backend**

## **🛠️ Features**

* **Authentication & Authorization:** JWT-based authentication with RBAC (**ADMIN**, **USER**)  
* **User Management:**  
  * Create admin accounts  
  * Fetch user profiles  
  * View all accounts (**Admin only**)  
* **Order Management:**  
  * Create orders (**USER only**)  
  * View user orders  
  * Admin functionalities for managing orders  
* **Chat Management:**  
  * Fetch chat history  
  * Close chat rooms (**Admin only**)  
* **Validation:** Input validation using **class-validator** and global exception filters for error handling  
* **Testing:** Integration tests with **Jest & Supertest**  
* **Documentation:** Comprehensive **Swagger UI** documentation

---

## **🧑‍💻 Technologies**

* **Framework:** NestJS  
* **ORM:** Prisma ORM  
* **Database:** PostgreSQL  
* **Authentication:** JWT  
* **Validation:** class-validator  
* **Testing:** Jest & Supertest  
* **Containerization:** Docker & Docker Compose

---

## **🚀 Running the Project**

### **1\. Run on Docker**

Build and start the Docker containers:

bash

Copy code

`docker-compose up --build`

* **API Base URL:** [http://localhost:3000](http://localhost:3000)  
* **Prisma Studio (Docker):** [http://localhost:5500](http://localhost:5500)  
* **API Documentation (Docker):** [http://localhost:8081](http://localhost:8081)

### **2\. Run on Local Environment**

Ensure you have a running instance of **PostgreSQL** locally.

bash

Copy code

`yarn start:dev`

* **API Base URL:** [http://localhost:3000](http://localhost:3000)  
* **API Documentation (Local):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## **📊 Prisma Studio**

**Local Environment:**  
bash  
Copy code  
`yarn prisma studio`

* Accessible at: [http://localhost:5555](http://localhost:5555)  
* **Docker Environment:**  
  Accessible at: [http://localhost:5500](http://localhost:5500)

---

## **📑 API Documentation**

* **Docker:** [http://localhost:8081](http://localhost:8081)  
* **Local:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## **💬 WebSocket Testing**

To test WebSocket functionalities, visit:  
[https://task.callydev.com](https://task.callydev.com)

---

## **🧪 Running Integration Tests**

### **Local Environment:**

bash

Copy code

`yarn test:integration`

### **Docker Environment:**

bash

Copy code

`docker-compose -f docker-compose-test.yml up`

---

## **⚙️ Database Configuration**

If you're running the app **locally**, ensure your `.env` file has the correct database connection:

env

Copy code

`DATABASE_URL="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}?schema=public"`

If you're running via **Docker**, ensure the `DATABASE_URL` points to the correct Docker network IP:

env

Copy code

`DATABASE_URL="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@postgres_db:5432/${DATABASE_NAME}?schema=public"`

To find your Docker database IP:

bash

Copy code

`docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres_db`

---

## **✅ Recommended Setup**

* Prefer running via **Docker** for simplicity and consistency.  
* Ensure `.env` files are configured appropriately for **local** and **Docker** environments.

---

## **📝 Contribution Guidelines**

* Fork the repository.  
* Create a feature branch: `git checkout -b feature-branch`.  
* Commit your changes: `git commit -m "Add new feature"`.  
* Push to the branch: `git push origin feature-branch`.  
* Open a pull request.

