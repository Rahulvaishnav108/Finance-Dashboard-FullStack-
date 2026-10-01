const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Target paths
const outputDir = path.join(__dirname, '..', 'postman', 'collections');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputPath = path.join(outputDir, 'testing-before-tenant-flow.postman_collection.json');

// Reusable parts
const jsonHeader = {
  key: "Content-Type",
  value: "application/json"
};

const sessionHeader = {
  key: "x-session-token",
  value: "{{sessionToken}}"
};

const jwtHeader = {
  key: "Authorization",
  value: "Bearer {{accessToken}}"
};

// Builder functions
function createRequest(name, method, urlRaw, headers = [], bodyRaw = null, testExec = null, pathVariables = []) {
  const reqObj = {
    id: crypto.randomUUID(),
    name,
    request: {
      method,
      header: headers
    }
  };

  if (pathVariables.length > 0) {
    reqObj.request.url = {
      raw: urlRaw,
      variable: pathVariables.map(variable => ({
        key: variable.key,
        value: variable.value,
        description: variable.description || ""
      }))
    };
  } else {
    reqObj.request.url = urlRaw;
  }

  if (bodyRaw) {
    reqObj.request.body = {
      mode: "raw",
      raw: typeof bodyRaw === 'string' ? bodyRaw : JSON.stringify(bodyRaw, null, 2),
      options: {
        raw: {
          language: "json"
        }
      }
    };
  }

  if (testExec) {
    reqObj.event = [
      {
        listen: "test",
        script: {
          exec: Array.isArray(testExec) ? testExec : [testExec],
          type: "text/javascript"
        }
      }
    ];
  }

  return reqObj;
}

// Complete JSON structure
const collection = {
  info: {
    _postman_id: "f3092e44-9553-4fb9-a979-5d1baca24018",
    name: "Testing before Tenant flow",
    description: "Standardized QA automation collection using stabilized, runtime-verified backend APIs only. Chains requests logically with dynamic variables.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    // 01-Auth Folder
    {
      id: crypto.randomUUID(),
      name: "01-Auth",
      item: [
        createRequest(
          "Register",
          "POST",
          "{{baseUrl}}/auth/register",
          [jsonHeader],
          {
            name: "Om",
            email: "om@example.com",
            mobile: "9999999999",
            password: "StrongPassword123"
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('accessToken', json.data.accessToken);",
            "  pm.environment.set('refreshToken', json.data.refreshToken);",
            "}",
            "pm.test('Register returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Login",
          "POST",
          "{{baseUrl}}/auth/login",
          [jsonHeader],
          {
            email: "om@example.com",
            password: "StrongPassword123"
          },
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('accessToken', json.data.accessToken);",
            "  pm.environment.set('refreshToken', json.data.refreshToken);",
            "}",
            "pm.test('Login returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Current User",
          "GET",
          "{{baseUrl}}/auth/me",
          [jwtHeader],
          null,
          [
            "pm.test('Get Me returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 02-Public Folder
    {
      id: crypto.randomUUID(),
      name: "02-Public",
      item: [
        createRequest(
          "Get Restaurant",
          "GET",
          "{{baseUrl}}/public/restaurants/:slug",
          [],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('restaurantId', json.data.restaurant.id || json.data.restaurant._id);",
            "}",
            "pm.test('Get Restaurant returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "slug", value: "amber-table", description: "Seeded restaurant slug" }]
        ),
        createRequest(
          "Get Public Menu",
          "GET",
          "{{baseUrl}}/public/menu/{{restaurantId}}",
          [],
          null,
          [
            "pm.test('Get Menu returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Create Table Session",
          "POST",
          "{{baseUrl}}/public/table-session/create",
          [jsonHeader],
          {
            token: "amber-table-t1-seed",
            customerName: "Om",
            mobile: "9999999999",
            partySize: 2,
            restaurantId: "{{restaurantId}}",
            tableId: "{{tableId}}"
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('sessionToken', json.data.sessionToken);",
            "  pm.environment.set('sessionId', json.data.sessionId);",
            "}",
            "pm.test('Create Table Session returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Validate Session",
          "POST",
          "{{baseUrl}}/public/table-session/validate",
          [jsonHeader, sessionHeader],
          {
            token: "{{sessionToken}}"
          },
          [
            "pm.test('Validate Session returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 03-Customer Folder
    {
      id: crypto.randomUUID(),
      name: "03-Customer",
      item: [
        createRequest(
          "Categories",
          "GET",
          "{{baseUrl}}/customer/menu/categories",
          [sessionHeader],
          null,
          [
            "pm.test('Categories returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Menu Items",
          "GET",
          "{{baseUrl}}/customer/menu/items",
          [sessionHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const items = json.data.items || [];",
            "  if (items.length > 0) {",
            "    pm.environment.set('menuItemId', items[0].id || items[0]._id);",
            "  }",
            "}",
            "pm.test('Menu Items returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Veg Filter",
          "GET",
          "{{baseUrl}}/customer/menu/items?veg=true",
          [sessionHeader],
          null,
          [
            "pm.test('Veg Filter returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Search",
          "GET",
          "{{baseUrl}}/customer/menu/items?search=burger",
          [sessionHeader],
          null,
          [
            "pm.test('Search returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Cart",
          "GET",
          "{{baseUrl}}/customer/cart",
          [sessionHeader],
          null,
          [
            "pm.test('Get Cart returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Add Item",
          "POST",
          "{{baseUrl}}/customer/cart/items",
          [jsonHeader, sessionHeader],
          {
            menuItem: "{{menuItemId}}",
            menuItemId: "{{menuItemId}}",
            quantity: 2
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  const items = json.data.items || [];",
            "  const item = items[items.length - 1];",
            "  if (item) {",
            "    pm.environment.set('cartItemId', item.id || item._id);",
            "  }",
            "}",
            "pm.test('Add Item returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Update Item",
          "PATCH",
          "{{baseUrl}}/customer/cart/items/:itemId",
          [jsonHeader, sessionHeader],
          {
            quantity: 3
          },
          [
            "pm.test('Update Item returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "itemId", value: "{{cartItemId}}", description: "Cart item ID" }]
        ),
        createRequest(
          "Remove Item",
          "DELETE",
          "{{baseUrl}}/customer/cart/items/:itemId",
          [sessionHeader],
          null,
          [
            "pm.test('Remove Item returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "itemId", value: "{{cartItemId}}", description: "Cart item ID to remove" }]
        ),
        createRequest(
          "Place Order",
          "POST",
          "{{baseUrl}}/customer/orders",
          [jsonHeader, sessionHeader],
          {
            specialInstructions: "Less oil please"
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('orderId', json.data.order.id || json.data.order._id);",
            "}",
            "pm.test('Place Order returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "List Orders",
          "GET",
          "{{baseUrl}}/customer/orders",
          [sessionHeader],
          null,
          [
            "pm.test('List Orders returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Order",
          "GET",
          "{{baseUrl}}/customer/orders/:id",
          [sessionHeader],
          null,
          [
            "pm.test('Get Order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Placed order ID" }]
        ),
        createRequest(
          "Session End",
          "POST",
          "{{baseUrl}}/customer/session/end",
          [sessionHeader],
          null,
          [
            "pm.test('Session End returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 04-Kitchen Folder
    {
      id: crypto.randomUUID(),
      name: "04-Kitchen",
      item: [
        createRequest(
          "Kitchen Orders",
          "GET",
          "{{baseUrl}}/kitchen/orders",
          [jwtHeader],
          null,
          [
            "pm.test('Kitchen Orders returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Accept Order",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/accept",
          [jsonHeader, jwtHeader],
          {
            estimatedPreparationTime: 12
          },
          [
            "pm.test('Accept Order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to accept" }]
        ),
        createRequest(
          "Start Cooking",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/start",
          [jwtHeader],
          null,
          [
            "pm.test('Start Cooking returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to start cooking" }]
        ),
        createRequest(
          "Mark Ready",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/ready",
          [jwtHeader],
          null,
          [
            "pm.test('Mark Ready returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to mark ready" }]
        ),
        createRequest(
          "Delay Order",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/delay",
          [jsonHeader, jwtHeader],
          {
            estimatedPreparationTime: 15,
            delayMinutes: 15
          },
          [
            "pm.test('Delay Order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to delay" }]
        )
      ]
    },
    // 05-Staff Folder
    {
      id: crypto.randomUUID(),
      name: "05-Staff",
      item: [
        createRequest(
          "Ready Queue",
          "GET",
          "{{baseUrl}}/staff/orders/ready",
          [jwtHeader],
          null,
          [
            "pm.test('Ready Queue returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Pick Order",
          "PATCH",
          "{{baseUrl}}/staff/orders/:id/pick",
          [jwtHeader],
          null,
          [
            "pm.test('Pick Order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to pick up" }]
        ),
        createRequest(
          "Serve Order",
          "PATCH",
          "{{baseUrl}}/staff/orders/:id/serve",
          [jwtHeader],
          null,
          [
            "pm.test('Serve Order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to serve" }]
        )
      ]
    },
    // 06-Billing Folder
    {
      id: crypto.randomUUID(),
      name: "06-Billing",
      item: [
        createRequest(
          "Get Bill",
          "GET",
          "{{baseUrl}}/customer/bill",
          [sessionHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  if (json.data && json.data.bill) {",
            "    pm.environment.set('billId', json.data.bill.id || json.data.bill._id);",
            "  }",
            "}",
            "pm.test('Get Bill returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Request Final Bill",
          "POST",
          "{{baseUrl}}/customer/bill/request",
          [sessionHeader],
          null,
          [
            "pm.test('Request Bill returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Apply Coupon",
          "POST",
          "{{baseUrl}}/customer/bill/coupon",
          [jsonHeader, sessionHeader],
          {
            couponCode: "DISCOUNT10"
          },
          [
            "pm.test('Apply Coupon returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 07-Payments Folder
    {
      id: crypto.randomUUID(),
      name: "07-Payments",
      item: [
        createRequest(
          "Create Payment",
          "POST",
          "{{baseUrl}}/customer/payments/create",
          [jsonHeader, sessionHeader],
          {
            orderId: "{{orderId}}",
            amount: 250,
            method: "UPI"
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('paymentId', json.data.payment.id || json.data.payment._id);",
            "}",
            "pm.test('Create Payment returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Verify Payment",
          "POST",
          "{{baseUrl}}/customer/payments/verify",
          [jsonHeader, sessionHeader],
          {
            paymentId: "{{paymentId}}",
            status: "SUCCESS"
          },
          [
            "pm.test('Verify Payment returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Payment Status",
          "GET",
          "{{baseUrl}}/customer/payments/:paymentId/status",
          [sessionHeader],
          null,
          [
            "pm.test('Get Payment Status returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "paymentId", value: "{{paymentId}}", description: "Payment Transaction ID" }]
        )
      ]
    },
    // 08-Cleaning Folder
    {
      id: crypto.randomUUID(),
      name: "08-Cleaning",
      item: [
        createRequest(
          "Cleaning Tasks",
          "GET",
          "{{baseUrl}}/cleaning/tasks",
          [jwtHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const tasks = json.data.tasks || [];",
            "  if (tasks.length > 0) {",
            "    pm.environment.set('taskId', tasks[0].id || tasks[0]._id);",
            "  }",
            "}",
            "pm.test('Cleaning Tasks returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Start Cleaning",
          "PATCH",
          "{{baseUrl}}/cleaning/tasks/:id/start",
          [jwtHeader],
          null,
          [
            "pm.test('Start Cleaning returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{taskId}}", description: "Cleaning task ID to start" }]
        ),
        createRequest(
          "Complete Cleaning",
          "PATCH",
          "{{baseUrl}}/cleaning/tasks/:id/complete",
          [jwtHeader],
          null,
          [
            "pm.test('Complete Cleaning returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{taskId}}", description: "Cleaning task ID to complete" }]
        )
      ]
    },
    // 09-Notifications Folder
    {
      id: crypto.randomUUID(),
      name: "09-Notifications",
      item: [
        createRequest(
          "List Notifications",
          "GET",
          "{{baseUrl}}/notifications",
          [jwtHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const notifications = json.data.notifications || [];",
            "  if (notifications.length > 0) {",
            "    pm.environment.set('notificationId', notifications[0].id || notifications[0]._id);",
            "  }",
            "}",
            "pm.test('List Notifications returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Mark Notification Read",
          "PATCH",
          "{{baseUrl}}/notifications/:id/read",
          [jwtHeader],
          null,
          [
            "pm.test('Mark Read returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{notificationId}}", description: "Notification ID to read" }]
        )
      ]
    },
    // 10-Health Folder
    {
      id: crypto.randomUUID(),
      name: "10-Health",
      item: [
        createRequest(
          "Health Check",
          "GET",
          "{{baseUrl}}/../../health",
          [],
          null,
          [
            "pm.test('Health returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Readiness Check",
          "GET",
          "{{baseUrl}}/../../ready",
          [],
          null,
          [
            "pm.test('Readiness returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Version Check",
          "GET",
          "{{baseUrl}}/../../version",
          [],
          null,
          [
            "pm.test('Version returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    }
  ],
  variable: [
    {
      key: "baseUrl",
      value: "http://localhost:5000/api/v1",
      type: "string"
    }
  ]
};

// Write output file
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
console.log(`Successfully compiled full Postman Collection to ${outputPath}`);
