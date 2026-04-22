import { Process, Processor } from "@nestjs/bull";
import { Job } from "bullmq";
import { MailService } from "./mail.service";
const puppeteer = require("puppeteer");


@Processor('mail-queue')
export class MailProcessor {
    constructor(
        private mailService: MailService
    ) { }
    @Process('vendor-mail')
    async handleVendorMail(job) {
        const { vendorMail } = job.data
        await this.mailService.sendOderInfoToVendor(vendorMail)
    }

    @Process('admin-mail')
    async handleAdminMail(job) {

        const { user, adminMail } = job.data
        await this.mailService.sendOderInfoToAdmin(adminMail, user)
    }

    @Process('user-mail')
    async handleOrderConfirmationMail(job) {
        const { user, orderDetails } = job.data

        this.generateInvoiceHTML(orderDetails).then(async (html) => {
            const pdfBuffer = await this.generatePDF(html)
            await this.mailService.sendOrderConfirmationMail(user.email, orderDetails, pdfBuffer)
        })
        // this.generateOrderConfirmationPDF(user, orderDetails).then(async (pdfBuffer) => {
        //     await this.mailService.sendOrderConfirmationMail(user.email, orderDetails, pdfBuffer)
        // });

    }

    async generateInvoiceHTML(order) {
        const itemsRows = order.items.map(item => `
    <tr>
      <td>${item.product.name}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">₹${item.product.price}</td>
      <td style="text-align:right;">₹${item.quantity * item.product.price}</td>
    </tr>
  `).join("");

        const subtotal = order.items.reduce(
            (sum, item) => sum + item.quantity * item.product.price, 0
        );

        const tax = 0;
        const total = subtotal + tax;

        return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #111;
        padding: 30px;
      }

      .container {
        max-width: 800px;
        margin: auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }

      .logo {
        font-size: 22px;
        font-weight: bold;
      }

      .section {
        margin-top: 20px;
      }

      .section h4 {
        margin-bottom: 5px;
      }

      .address {
        line-height: 1.5;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }

      th {
        background: #f2f2f2;
        border-bottom: 1px solid #ccc;
        padding: 10px;
        text-align: left;
      }

      td {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }

      .summary {
        margin-top: 20px;
        width: 300px;
        margin-left: auto;
      }

      .summary div {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
      }

      .total {
        font-weight: bold;
        border-top: 2px solid #000;
        padding-top: 10px;
      }

      .footer {
        margin-top: 40px;
        font-size: 11px;
        color: #555;
        border-top: 1px solid #ddd;
        padding-top: 10px;
      }

    </style>
  </head>

  <body>
    <div class="container">

      <!-- Header -->
      <div class="header">
        <div class="logo">Dash Stack</div>
        <div>
          <div><strong>Invoice</strong></div>
          <div>Order ID: ${order.id}</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <!-- Addresses -->
      <div class="section">
        <table>
          <tr>
            <td width="50%">
              <h4>Billing Address</h4>
              <div class="address">
                ${order.user.name}<br/>
                ${order.deliveryAddress.fullName}<br/>
                ${order.deliveryAddress.streetAddress}<br/>
                ${order.deliveryAddress.landmark ? order.deliveryAddress.landmark + "<br/>" : ""}
                ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.postalCode}<br/>
                ${order.deliveryAddress.country}<br/>
                Phone: ${order.deliveryAddress.phoneNumber}
              </div>
            </td>
            <td width="50%">
              <h4>Shipping Address</h4>
              <div class="address">
                <div class="address">
                ${order.user.name}<br/>
                ${order.deliveryAddress.fullName}<br/>
                ${order.deliveryAddress.streetAddress}<br/>
                ${order.deliveryAddress.landmark ? order.deliveryAddress.landmark + "<br/>" : ""}
                ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.postalCode}<br/>
                ${order.deliveryAddress.country}<br/>
                Phone: ${order.deliveryAddress.phoneNumber}
              </div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <div class="section">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="summary">
        <div><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
        <div><span>GST</span><span>₹${tax.toFixed(2)}</span></div>
        <div class="total">
          <span>Grand Total</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        This is a computer-generated invoice and does not require a signature.<br/>
        For support, contact support@dashstack.com
      </div>

    </div>
  </body>
  </html>
  `;
    }

    async generatePDF(html) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(html, { waitUntil: "load" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        await browser.close();
        return pdfBuffer;
    }

    @Process('registration-mail')
    async sendRegistrationMail(job) {
        console.log("Registration mail added to queue")
        const { email, name, token } = job.data
        await this.mailService.sendMail(email, name, token)
    }

}