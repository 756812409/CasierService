using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Windows;
using System.Drawing.Printing;
using System.Drawing;
using System.Windows.Forms;
namespace CasierV2.Models
{
    public class Ticket
    {
        PrintDocument pdoc = null;
        InvoiceHeaderSet invoice;
        Info currentInfo;
        string option;
        public Ticket()
        {

        }
        public Ticket(InvoiceHeaderSet invoice, string isCopy, Info info)
        {
            this.option = isCopy;
            this.invoice = invoice;
            this.currentInfo = info;

        }
        public void print()
        {
            PrintDialog pd = new PrintDialog();
            pdoc = new PrintDocument();
            PrinterSettings ps = new PrinterSettings();
            Font font = new Font("Courier New", 15);


            PaperSize psize = new PaperSize("Custom", 100, 200);
            //ps.DefaultPageSettings.PaperSize = psize;

            pd.Document = pdoc;
            pd.Document.DefaultPageSettings.PaperSize = psize;
            //pdoc.DefaultPageSettings.PaperSize.Height =320;
            pdoc.DefaultPageSettings.PaperSize.Height = 820;

            pdoc.DefaultPageSettings.PaperSize.Width = 520;

       

            pdoc.PrintPage += new PrintPageEventHandler(pdoc_PrintPage);

        //    DialogResult result = pd.ShowDialog();
        //    if (result == DialogResult.OK)
            {
                PrintPreviewDialog pp = new PrintPreviewDialog();
                pp.Document = pdoc;
              //  result = pp.ShowDialog();
              //  if (result == DialogResult.OK)
                {
                    pdoc.Print();
                }
            }

        }
        void pdoc_PrintPage(object sender, PrintPageEventArgs e)
        {
            
            Graphics graphics = e.Graphics;
            Font font = new Font("Courier New", 10);
            float fontHeight = font.GetHeight();
            int startX = 50;
            int startY = 55;
            int Offset = 40;
            graphics.DrawString("                     "+ currentInfo.name, new Font("Courier New", 14),
                                new SolidBrush(Color.Black), startX, startY + Offset);
            Offset = Offset + 20;
            graphics.DrawString("                    " + currentInfo.street,
                     new Font("Courier New", 14),
                     new SolidBrush(Color.Black), startX, startY + Offset);
            Offset = Offset + 20;
            graphics.DrawString("                       Dato " + this.invoice.PayDate,
                     new Font("Courier New", 14),
                     new SolidBrush(Color.Black), startX, startY + Offset);
            Offset = Offset + 20; 
            graphics.DrawString("                     " + currentInfo.number, new Font("Courier New", 14),                 
                    new SolidBrush(Color.Black), startX, startY + Offset);
            Offset = Offset + 20;
            graphics.DrawString("                       " + currentInfo.cvr,
                   new Font("Courier New", 14),
                   new SolidBrush(Color.Black), startX, startY + Offset);
            Offset = Offset + 20;
            graphics.DrawString("                          Id: " + this.invoice.InvoiceHeaderSetId,
                   new Font("Courier New", 14),
                   new SolidBrush(Color.Black), startX, startY + Offset);
            Offset = Offset + 20;
            Offset = Offset + 20;
      
            var totalToPrint = 0;

          //  try {
                 
          //  foreach(InvoiceHeaderDetailsSet invoiceDetails  in invoice.InvoiceHeaderDetailsSet) {

                    //var quantity = (short)invoiceDetails.Quantity;
                    //var price =  (invoiceDetails.ItemSet.Price);
                    //var sum = quantity * price;
                    //totalToPrint +=(int)sum;

                    //* invoiceDetails.Sum;
                //    Offset = Offset + 20;
                //    graphics.DrawString(invoiceDetails.Quantity + "         " + invoiceDetails.ItemSet.Name + "    " + sum + " Kr"
                //        , new Font("Courier New", 16),
                //         new SolidBrush(Color.Black), startX, startY + Offset);
                //}
            //}catch(Exception ex)
            //{

            //}
            //Offset = Offset + 20;
            //String Grosstotal = "                                                                                 Total " + totalToPrint;

            //Offset = Offset + 20;
            //graphics.DrawString(Grosstotal, new Font("Courier New", 20),
            //         new SolidBrush(Color.Black), startX, startY + Offset);
            //Offset = Offset + 20;
     
            //graphics.DrawString("                  "+ currentInfo.endText , new Font("Courier New", 16),
            //         new SolidBrush(Color.Black), startX, startY + Offset);
        }
    }
}