interface Props {
  fetchedAt: string;
}

export default function Footer({ fetchedAt }: Props) {
  const formatted = fetchedAt
    ? new Date(fetchedAt).toLocaleString('cs-CZ', { dateStyle: 'long', timeStyle: 'short' })
    : '—';

  return (
    <footer style={{
      marginTop: 48,
      borderTop: '1px solid #e5e7eb',
      padding: '16px 24px',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: 11, color: '#bbb', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em' }}>
        © Metrostav Development a.s.
      </span>
      <span style={{ fontSize: 11, color: '#bbb', fontFamily: 'Inter, sans-serif' }}>
        Data aktualizována: <strong style={{ color: '#888' }}>{formatted}</strong>
      </span>
    </footer>
  );
}
