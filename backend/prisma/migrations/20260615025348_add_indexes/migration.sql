-- CreateIndex
CREATE INDEX "Expense_politicianId_idx" ON "Expense"("politicianId");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- CreateIndex
CREATE INDEX "Expense_expenseDate_idx" ON "Expense"("expenseDate");
