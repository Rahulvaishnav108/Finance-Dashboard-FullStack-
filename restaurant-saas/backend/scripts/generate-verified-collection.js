const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Target paths
const outputDir = path.join(__dirname, '..', 'postman', 'collections');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputPath = path.join(outputDir, 'restaurant-automation-api-verified.postman_collection.json');

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
    _postman_id: "a7c2b04f-12df-4235-862d-90518cc3cf90",
    name: "Restaurant Automation API - Verified",
    description: "Production-ready, runtime-verified QA automation collection mapping all stabilized endpoints grouped into the 12 required folders.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    // 01 Auth Folder
    {
      id: crypto.randomUUID(),
      name: "01 Auth",
      item: [
        createRequest(
          "Register User",
          "POST",
          "{{baseUrl}}/auth/register",
          [jsonHeader],
          {
            name: "Verified Staff",
            email: "verified.staff@example.com",
            mobile: "9876543220",
            password: "VerifiedPassword123"
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
          "Login User",
          "POST",
          "{{baseUrl}}/auth/login",
          [jsonHeader],
          {
            email: "verified.staff@example.com",
            password: "VerifiedPassword123"
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
          "Get Current Profile",
          "GET",
          "{{baseUrl}}/auth/me",
          [jwtHeader],
          null,
          [
            "pm.test('Get Me returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Refresh Token Pair",
          "POST",
          "{{baseUrl}}/auth/refresh",
          [jsonHeader],
          {
            refreshToken: "{{refreshToken}}"
          },
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('accessToken', json.data.accessToken);",
            "  pm.environment.set('refreshToken', json.data.refreshToken);",
            "}",
            "pm.test('Refresh returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Request Reset OTP",
          "POST",
          "{{baseUrl}}/auth/forgot-password",
          [jsonHeader],
          {
            email: "verified.staff@example.com"
          },
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('resetOtp', json.data.otp);",
            "}",
            "pm.test('Forgot password returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 02 Public Folder
    {
      id: crypto.randomUUID(),
      name: "02 Public",
      item: [
        createRequest(
          "Get Restaurant Details",
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
          "{{baseUrl}}/public/menu/{{restaurantId}}/items",
          [],
          null,
          [
            "pm.test('Get Public Menu items returns 200 OK', function () {",
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
            customerName: "Public Guest",
            mobile: "9876543210",
            partySize: 3
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('sessionToken', json.data.sessionToken);",
            "  pm.environment.set('sessionId', json.data.sessionId);",
            "}",
            "pm.test('Create Session returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Validate Table Session",
          "POST",
          "{{baseUrl}}/public/table-session/validate",
          [jsonHeader],
          {
            token: "{{sessionToken}}"
          },
          [
            "pm.test('Validate session returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Check Reservation Availability",
          "GET",
          "{{baseUrl}}/public/reservations/availability?restaurantId={{restaurantId}}&date=2026-06-15&guests=2",
          [],
          null,
          [
            "pm.test('Availability check returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Join Public Queue",
          "POST",
          "{{baseUrl}}/public/queue/join",
          [jsonHeader],
          {
            restaurantId: "{{restaurantId}}",
            customerName: "Queue Customer",
            guests: 4
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('queueId', json.data.queueEntry._id);",
            "}",
            "pm.test('Queue join returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        )
      ]
    },
    // 03 Customer Folder
    {
      id: crypto.randomUUID(),
      name: "03 Customer",
      item: [
        createRequest(
          "Get Current Session",
          "GET",
          "{{baseUrl}}/customer/session",
          [sessionHeader],
          null,
          [
            "pm.test('Get Session returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Extend Session Duration",
          "PATCH",
          "{{baseUrl}}/customer/session/extend",
          [sessionHeader],
          null,
          [
            "pm.test('Extend returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Customer Menu Items",
          "GET",
          "{{baseUrl}}/customer/menu/items",
          [sessionHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const items = json.data.items || [];",
            "  if (items.length > 0) {",
            "    pm.environment.set('menuItemId', items[0]._id || items[0].id);",
            "  }",
            "}",
            "pm.test('Customer Menu items returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Active Cart",
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
          "Add Item to Cart",
          "POST",
          "{{baseUrl}}/customer/cart/items",
          [jsonHeader, sessionHeader],
          {
            menuItemId: "{{menuItemId}}",
            quantity: 2
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  const items = json.data.items || [];",
            "  if (items.length > 0) {",
            "    pm.environment.set('cartItemId', items[0]._id || items[0].id);",
            "  }",
            "}",
            "pm.test('Add item returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Place Order from Cart",
          "POST",
          "{{baseUrl}}/customer/orders",
          [jsonHeader, sessionHeader],
          {
            specialInstructions: "Extra spicy"
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('orderId', json.data.order._id || json.data.order.id);",
            "}",
            "pm.test('Place Order returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Get Placed Order Details",
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
          "Submit Service Request",
          "POST",
          "{{baseUrl}}/customer/requests/water",
          [sessionHeader],
          null,
          [
            "pm.test('Service request returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Submit Review Feedback",
          "POST",
          "{{baseUrl}}/customer/feedback",
          [jsonHeader, sessionHeader],
          {
            rating: 5,
            comment: "Excellent service!"
          },
          [
            "pm.test('Feedback returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Get Loyalty Stats",
          "GET",
          "{{baseUrl}}/customer/loyalty",
          [sessionHeader],
          null,
          [
            "pm.test('Loyalty returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 04 Kitchen Folder
    {
      id: crypto.randomUUID(),
      name: "04 Kitchen",
      item: [
        createRequest(
          "Kitchen Dashboard Overview",
          "GET",
          "{{baseUrl}}/kitchen/orders",
          [jwtHeader],
          null,
          [
            "pm.test('Kitchen orders returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Accept New Order",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/accept",
          [jsonHeader, jwtHeader],
          {
            estimatedPreparationTime: 15
          },
          [
            "pm.test('Accept order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to accept" }]
        ),
        createRequest(
          "Start Cooking Order",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/start",
          [jwtHeader],
          null,
          [
            "pm.test('Start cooking returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to prepare" }]
        ),
        createRequest(
          "Mark Order Ready",
          "PATCH",
          "{{baseUrl}}/kitchen/orders/:id/ready",
          [jwtHeader],
          null,
          [
            "pm.test('Mark ready returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID completed" }]
        )
      ]
    },
    // 05 Staff Folder
    {
      id: crypto.randomUUID(),
      name: "05 Staff",
      item: [
        createRequest(
          "Get Ready Orders",
          "GET",
          "{{baseUrl}}/staff/orders/ready",
          [jwtHeader],
          null,
          [
            "pm.test('Get ready orders returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Pick Ready Order",
          "PATCH",
          "{{baseUrl}}/staff/orders/:id/pick",
          [jwtHeader],
          null,
          [
            "pm.test('Pick order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID to pick up" }]
        ),
        createRequest(
          "Serve Order to Table",
          "PATCH",
          "{{baseUrl}}/staff/orders/:id/serve",
          [jwtHeader],
          null,
          [
            "pm.test('Serve order returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{orderId}}", description: "Order ID served" }]
        ),
        createRequest(
          "Get Active Table Sessions",
          "GET",
          "{{baseUrl}}/staff/tables",
          [jwtHeader],
          null,
          [
            "pm.test('Staff get tables returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 06 Billing Folder
    {
      id: crypto.randomUUID(),
      name: "06 Billing",
      item: [
        createRequest(
          "Get Live Bill details",
          "GET",
          "{{baseUrl}}/customer/bill",
          [sessionHeader],
          null,
          [
            "pm.test('Get Live Bill returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Request Final Checkout Bill",
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
          "Apply Eligible Coupon",
          "POST",
          "{{baseUrl}}/customer/bill/coupon",
          [jsonHeader, sessionHeader],
          {
            couponCode: "DISCOUNT20"
          },
          [
            "pm.test('Apply Coupon returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 07 Payments Folder
    {
      id: crypto.randomUUID(),
      name: "07 Payments",
      item: [
        createRequest(
          "Create Payment Order",
          "POST",
          "{{baseUrl}}/customer/payments/create",
          [jsonHeader, sessionHeader],
          {
            orderId: "{{orderId}}",
            amount: 150,
            method: "UPI"
          },
          [
            "if (pm.response.code === 201) {",
            "  const json = pm.response.json();",
            "  pm.environment.set('paymentId', json.data.payment._id || json.data.payment.id);",
            "}",
            "pm.test('Create Payment returns 201 Created', function () {",
            "  pm.response.to.have.status(201);",
            "});"
          ]
        ),
        createRequest(
          "Verify Payment Status",
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
        )
      ]
    },
    // 08 Cleaning Folder
    {
      id: crypto.randomUUID(),
      name: "08 Cleaning",
      item: [
        createRequest(
          "Get Active Cleaning Queue",
          "GET",
          "{{baseUrl}}/cleaning/tasks?status=PENDING",
          [jwtHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const tasks = json.data.tasks || [];",
            "  if (tasks.length > 0) {",
            "    pm.environment.set('cleaningTaskId', tasks[0]._id || tasks[0].id);",
            "  }",
            "}",
            "pm.test('Cleaning Tasks returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Start Table Cleaning",
          "PATCH",
          "{{baseUrl}}/cleaning/tasks/:id/start",
          [jwtHeader],
          null,
          [
            "pm.test('Start cleaning returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{cleaningTaskId}}", description: "Cleaning task ID" }]
        ),
        createRequest(
          "Complete Table Cleaning",
          "PATCH",
          "{{baseUrl}}/cleaning/tasks/:id/complete",
          [jwtHeader],
          null,
          [
            "pm.test('Complete cleaning returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{cleaningTaskId}}", description: "Cleaning task ID" }]
        )
      ]
    },
    // 09 Notifications Folder
    {
      id: crypto.randomUUID(),
      name: "09 Notifications",
      item: [
        createRequest(
          "Get Notifications Inbox",
          "GET",
          "{{baseUrl}}/notifications",
          [jwtHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const alerts = json.data.notifications || [];",
            "  if (alerts.length > 0) {",
            "    pm.environment.set('notificationId', alerts[0]._id || alerts[0].id);",
            "  }",
            "}",
            "pm.test('List notifications returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Mark Notification as Read",
          "PATCH",
          "{{baseUrl}}/notifications/:id/read",
          [jwtHeader],
          null,
          [
            "pm.test('Mark read returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ],
          [{ key: "id", value: "{{notificationId}}", description: "Notification alert ID" }]
        )
      ]
    },
    // 10 Health Folder
    {
      id: crypto.randomUUID(),
      name: "10 Health",
      item: [
        createRequest(
          "Liveness Probe Check",
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
          "Readiness Probe Check",
          "GET",
          "{{baseUrl}}/../../ready",
          [],
          null,
          [
            "pm.test('Readiness returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 11 Admin Folder
    {
      id: crypto.randomUUID(),
      name: "11 Admin",
      item: [
        createRequest(
          "Get Restaurant Overview Dashboard",
          "GET",
          "{{baseUrl}}/admin/restaurant/overview",
          [jwtHeader],
          null,
          [
            "pm.test('Admin overview returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Restaurant Setting Configurations",
          "GET",
          "{{baseUrl}}/admin/restaurant/settings",
          [jwtHeader],
          null,
          [
            "pm.test('Get settings returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get In-Use Tables",
          "GET",
          "{{baseUrl}}/admin/tables",
          [jwtHeader],
          null,
          [
            "if (pm.response.code === 200) {",
            "  const json = pm.response.json();",
            "  const tbls = json.data.tables || [];",
            "  if (tbls.length > 0) {",
            "    pm.environment.set('adminTableId', tbls[0]._id || tbls[0].id);",
            "  }",
            "}",
            "pm.test('Admin tables returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "Get Inventory Low Stock Alerts",
          "GET",
          "{{baseUrl}}/admin/inventory/alerts",
          [jwtHeader],
          null,
          [
            "pm.test('Inventory alerts returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        )
      ]
    },
    // 12 Super Admin Folder
    {
      id: crypto.randomUUID(),
      name: "12 Super Admin",
      item: [
        createRequest(
          "Get Platform Metric Overview",
          "GET",
          "{{baseUrl}}/super-admin/platform/overview",
          [jwtHeader],
          null,
          [
            "pm.test('SuperAdmin overview returns 200 OK', function () {",
            "  pm.response.to.have.status(200);",
            "});"
          ]
        ),
        createRequest(
          "List SaaS Tenants",
          "GET",
          "{{baseUrl}}/super-admin/restaurants",
          [jwtHeader],
          null,
          [
            "pm.test('SaaS tenants list returns 200 OK', function () {",
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
console.log(`Successfully compiled Verified Postman Collection to ${outputPath}`);
