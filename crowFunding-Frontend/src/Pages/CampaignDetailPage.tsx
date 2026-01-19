import { useParams } from "react-router-dom";

function CampaignDetailPage() {
  const { address } = useParams<{ address: string }>();
  return (
    <div>
      <h2>Campaign Detail Page</h2>
      <p>This is where users can view the details of a specific campaign.</p>
      <p>Address: {address}</p>
    </div>
  );
}

export default CampaignDetailPage;
