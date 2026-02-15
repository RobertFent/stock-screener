ALTER TABLE "filters" ADD COLUMN "close_above_ma200" boolean DEFAULT false;
CREATE INDEX CONCURRENTLY idx_stock_data_ticker_date ON stock_data (ticker, date DESC);