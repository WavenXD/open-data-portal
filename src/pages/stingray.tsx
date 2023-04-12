import type { NextPage } from "next";
import Container from "@mui/material/Container";
import StingrayView from "~/components/Stingray";

const StingrayPage: NextPage<{}> = () => {
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 50,
        marginBottom: 50,
      }}
      maxWidth={"xl"}
    >
      <StingrayView />
    </Container>
  );

<div class="w3-container w3-red">
  <p>London is the capital city of England.</p>
</div>
};



export default StingrayPage;
