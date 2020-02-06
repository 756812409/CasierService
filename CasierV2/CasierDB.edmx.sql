
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 05/02/2017 00:02:36
-- Generated from EDMX file: C:\Users\LI\Documents\Visual Studio 2015\Projects\CasierV2\CasierV2\CasierDB.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [CasierContent];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[FK_CategorySetItemSet]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[ItemSet] DROP CONSTRAINT [FK_CategorySetItemSet];
GO
IF OBJECT_ID(N'[dbo].[FK_CreatorSetInvoiceHeaderSet]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[InvoiceHeaderSet] DROP CONSTRAINT [FK_CreatorSetInvoiceHeaderSet];
GO
IF OBJECT_ID(N'[dbo].[FK_CreatorSetWorkinghoursSet]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[WorkinghoursSet] DROP CONSTRAINT [FK_CreatorSetWorkinghoursSet];
GO
IF OBJECT_ID(N'[dbo].[FK_InvoiceHeaderSetInvoiceHeaderDetailsSet]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[InvoiceHeaderDetailsSet] DROP CONSTRAINT [FK_InvoiceHeaderSetInvoiceHeaderDetailsSet];
GO
IF OBJECT_ID(N'[dbo].[FK_ReservationSetInvoiceHeaderSet]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[InvoiceHeaderSet] DROP CONSTRAINT [FK_ReservationSetInvoiceHeaderSet];
GO
IF OBJECT_ID(N'[dbo].[FK_InvoiceHeaderDetailsSetItemSet]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[InvoiceHeaderDetailsSet] DROP CONSTRAINT [FK_InvoiceHeaderDetailsSetItemSet];
GO

-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[CategorySet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CategorySet];
GO
IF OBJECT_ID(N'[dbo].[CreatorSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[CreatorSet];
GO
IF OBJECT_ID(N'[dbo].[InvoiceHeaderDetailsSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[InvoiceHeaderDetailsSet];
GO
IF OBJECT_ID(N'[dbo].[InvoiceHeaderSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[InvoiceHeaderSet];
GO
IF OBJECT_ID(N'[dbo].[ItemSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[ItemSet];
GO
IF OBJECT_ID(N'[dbo].[ReservationSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[ReservationSet];
GO
IF OBJECT_ID(N'[dbo].[WorkinghoursSet]', 'U') IS NOT NULL
    DROP TABLE [dbo].[WorkinghoursSet];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'CategorySet'
CREATE TABLE [dbo].[CategorySet] (
    [CategoryId] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL
);
GO

-- Creating table 'CreatorSet'
CREATE TABLE [dbo].[CreatorSet] (
    [CreatorId] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL,
    [Phone] nvarchar(max)  NULL,
    [CPR] nvarchar(max)  NULL,
    [MonthSalary] decimal(18,0)  NULL,
    [HourSalary] decimal(18,0)  NULL,
    [Description] nvarchar(max)  NULL,
    [Evaluation] nvarchar(max)  NULL,
    [BankInfo] nvarchar(max)  NULL
);
GO

-- Creating table 'InvoiceHeaderDetailsSet'
CREATE TABLE [dbo].[InvoiceHeaderDetailsSet] (
    [InvoiceHeaderDetailsId] int IDENTITY(1,1) NOT NULL,
    [Quantity] smallint  NULL,
    [OrderTime] datetime  NULL,
    [InvoiceHeaderSetInvoiceHeaderSetId] int  NOT NULL,
    [ItemSet_ItemSetId] int  NOT NULL
);
GO

-- Creating table 'InvoiceHeaderSet'
CREATE TABLE [dbo].[InvoiceHeaderSet] (
    [InvoiceHeaderSetId] int IDENTITY(1,1) NOT NULL,
    [Total] decimal(18,0)  NULL,
    [Number] nvarchar(max)  NULL,
    [Description] nvarchar(max)  NULL,
    [CreateDate] datetime  NULL,
    [PayDate] datetime  NULL,
    [CreatorSetCreatorId] int  NULL,
    [ReservationSetReservationId] int  NULL
);
GO

-- Creating table 'ItemSet'
CREATE TABLE [dbo].[ItemSet] (
    [ItemSetId] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL,
    [Number] nvarchar(max)  NULL,
    [Price] decimal(18,0)  NULL,
    [Discount] smallint  NULL,
    [Description] nvarchar(max)  NULL,
    [CategorySetCategoryId] int  NOT NULL
);
GO

-- Creating table 'ReservationSet'
CREATE TABLE [dbo].[ReservationSet] (
    [ReservationId] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(max)  NULL,
    [DateTime] datetime  NULL,
    [Email] nvarchar(max)  NULL,
    [Phone] nvarchar(max)  NULL,
    [Amount] nvarchar(max)  NULL,
    [Description] nvarchar(max)  NULL
);
GO

-- Creating table 'WorkinghoursSet'
CREATE TABLE [dbo].[WorkinghoursSet] (
    [WorkingHoursId] int IDENTITY(1,1) NOT NULL,
    [StartHour] datetime  NULL,
    [EndHour] datetime  NULL,
    [CreatorSetCreatorId] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [CategoryId] in table 'CategorySet'
ALTER TABLE [dbo].[CategorySet]
ADD CONSTRAINT [PK_CategorySet]
    PRIMARY KEY CLUSTERED ([CategoryId] ASC);
GO

-- Creating primary key on [CreatorId] in table 'CreatorSet'
ALTER TABLE [dbo].[CreatorSet]
ADD CONSTRAINT [PK_CreatorSet]
    PRIMARY KEY CLUSTERED ([CreatorId] ASC);
GO

-- Creating primary key on [InvoiceHeaderDetailsId] in table 'InvoiceHeaderDetailsSet'
ALTER TABLE [dbo].[InvoiceHeaderDetailsSet]
ADD CONSTRAINT [PK_InvoiceHeaderDetailsSet]
    PRIMARY KEY CLUSTERED ([InvoiceHeaderDetailsId] ASC);
GO

-- Creating primary key on [InvoiceHeaderSetId] in table 'InvoiceHeaderSet'
ALTER TABLE [dbo].[InvoiceHeaderSet]
ADD CONSTRAINT [PK_InvoiceHeaderSet]
    PRIMARY KEY CLUSTERED ([InvoiceHeaderSetId] ASC);
GO

-- Creating primary key on [ItemSetId] in table 'ItemSet'
ALTER TABLE [dbo].[ItemSet]
ADD CONSTRAINT [PK_ItemSet]
    PRIMARY KEY CLUSTERED ([ItemSetId] ASC);
GO

-- Creating primary key on [ReservationId] in table 'ReservationSet'
ALTER TABLE [dbo].[ReservationSet]
ADD CONSTRAINT [PK_ReservationSet]
    PRIMARY KEY CLUSTERED ([ReservationId] ASC);
GO

-- Creating primary key on [WorkingHoursId] in table 'WorkinghoursSet'
ALTER TABLE [dbo].[WorkinghoursSet]
ADD CONSTRAINT [PK_WorkinghoursSet]
    PRIMARY KEY CLUSTERED ([WorkingHoursId] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [CategorySetCategoryId] in table 'ItemSet'
ALTER TABLE [dbo].[ItemSet]
ADD CONSTRAINT [FK_CategorySetItemSet]
    FOREIGN KEY ([CategorySetCategoryId])
    REFERENCES [dbo].[CategorySet]
        ([CategoryId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_CategorySetItemSet'
CREATE INDEX [IX_FK_CategorySetItemSet]
ON [dbo].[ItemSet]
    ([CategorySetCategoryId]);
GO

-- Creating foreign key on [CreatorSetCreatorId] in table 'InvoiceHeaderSet'
ALTER TABLE [dbo].[InvoiceHeaderSet]
ADD CONSTRAINT [FK_CreatorSetInvoiceHeaderSet]
    FOREIGN KEY ([CreatorSetCreatorId])
    REFERENCES [dbo].[CreatorSet]
        ([CreatorId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_CreatorSetInvoiceHeaderSet'
CREATE INDEX [IX_FK_CreatorSetInvoiceHeaderSet]
ON [dbo].[InvoiceHeaderSet]
    ([CreatorSetCreatorId]);
GO

-- Creating foreign key on [CreatorSetCreatorId] in table 'WorkinghoursSet'
ALTER TABLE [dbo].[WorkinghoursSet]
ADD CONSTRAINT [FK_CreatorSetWorkinghoursSet]
    FOREIGN KEY ([CreatorSetCreatorId])
    REFERENCES [dbo].[CreatorSet]
        ([CreatorId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_CreatorSetWorkinghoursSet'
CREATE INDEX [IX_FK_CreatorSetWorkinghoursSet]
ON [dbo].[WorkinghoursSet]
    ([CreatorSetCreatorId]);
GO

-- Creating foreign key on [InvoiceHeaderSetInvoiceHeaderSetId] in table 'InvoiceHeaderDetailsSet'
ALTER TABLE [dbo].[InvoiceHeaderDetailsSet]
ADD CONSTRAINT [FK_InvoiceHeaderSetInvoiceHeaderDetailsSet]
    FOREIGN KEY ([InvoiceHeaderSetInvoiceHeaderSetId])
    REFERENCES [dbo].[InvoiceHeaderSet]
        ([InvoiceHeaderSetId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_InvoiceHeaderSetInvoiceHeaderDetailsSet'
CREATE INDEX [IX_FK_InvoiceHeaderSetInvoiceHeaderDetailsSet]
ON [dbo].[InvoiceHeaderDetailsSet]
    ([InvoiceHeaderSetInvoiceHeaderSetId]);
GO

-- Creating foreign key on [ReservationSetReservationId] in table 'InvoiceHeaderSet'
ALTER TABLE [dbo].[InvoiceHeaderSet]
ADD CONSTRAINT [FK_ReservationSetInvoiceHeaderSet]
    FOREIGN KEY ([ReservationSetReservationId])
    REFERENCES [dbo].[ReservationSet]
        ([ReservationId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_ReservationSetInvoiceHeaderSet'
CREATE INDEX [IX_FK_ReservationSetInvoiceHeaderSet]
ON [dbo].[InvoiceHeaderSet]
    ([ReservationSetReservationId]);
GO

-- Creating foreign key on [ItemSet_ItemSetId] in table 'InvoiceHeaderDetailsSet'
ALTER TABLE [dbo].[InvoiceHeaderDetailsSet]
ADD CONSTRAINT [FK_InvoiceHeaderDetailsSetItemSet]
    FOREIGN KEY ([ItemSet_ItemSetId])
    REFERENCES [dbo].[ItemSet]
        ([ItemSetId])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_InvoiceHeaderDetailsSetItemSet'
CREATE INDEX [IX_FK_InvoiceHeaderDetailsSetItemSet]
ON [dbo].[InvoiceHeaderDetailsSet]
    ([ItemSet_ItemSetId]);
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------