-- Tabla para registros de apertura de caja
CREATE TABLE IF NOT EXISTS cash_register_openings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_name TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    initial_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicados por vendedor y fecha
    CONSTRAINT unique_opening_per_seller_per_day UNIQUE (seller_id, date)
);

-- Tabla para registros de cierre de caja
CREATE TABLE IF NOT EXISTS cash_register_closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_name TEXT,
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    opening_id UUID NOT NULL REFERENCES cash_register_openings(id) ON DELETE CASCADE,
    initial_amount DECIMAL(10, 2) NOT NULL,
    final_amount DECIMAL(10, 2) NOT NULL,
    expenses DECIMAL(10, 2) NOT NULL DEFAULT 0,
    expenses_details TEXT,
    difference DECIMAL(10, 2) NOT NULL,
    payment_breakdown JSONB NOT NULL DEFAULT '{"cash": 0, "card": 0, "digital": 0}',
    total_sales DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicados por vendedor y fecha
    CONSTRAINT unique_closure_per_seller_per_day UNIQUE (seller_id, date)
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_cash_openings_seller_id ON cash_register_openings(seller_id);
CREATE INDEX IF NOT EXISTS idx_cash_openings_date ON cash_register_openings(date);
CREATE INDEX IF NOT EXISTS idx_cash_openings_business_id ON cash_register_openings(business_id);

CREATE INDEX IF NOT EXISTS idx_cash_closures_seller_id ON cash_register_closures(seller_id);
CREATE INDEX IF NOT EXISTS idx_cash_closures_date ON cash_register_closures(date);
CREATE INDEX IF NOT EXISTS idx_cash_closures_business_id ON cash_register_closures(business_id);
CREATE INDEX IF NOT EXISTS idx_cash_closures_opening_id ON cash_register_closures(opening_id);

-- Políticas RLS (Row Level Security) para cash_register_openings
ALTER TABLE cash_register_openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read own openings" ON cash_register_openings
    FOR SELECT USING (
        seller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (role = 'OWNER' OR role = 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Allow insert own openings" ON cash_register_openings
    FOR INSERT WITH CHECK (seller_id = auth.uid());

-- Políticas RLS para cash_register_closures
ALTER TABLE cash_register_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read own closures" ON cash_register_closures
    FOR SELECT USING (
        seller_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND (role = 'OWNER' OR role = 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Allow insert own closures" ON cash_register_closures
    FOR INSERT WITH CHECK (seller_id = auth.uid());

-- Comentarios para documentación
COMMENT ON TABLE cash_register_openings IS 'Registros de apertura de caja por vendedor y día';
COMMENT ON TABLE cash_register_closures IS 'Registros de cierre de caja por vendedor y día';
