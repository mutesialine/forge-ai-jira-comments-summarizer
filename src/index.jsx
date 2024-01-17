import ForgeUI, {
  render,
  Fragment,
  Text,
  IssuePanel,
  useProductContext,
  useState,
} from "@forge/ui";
import api, { route, fetch } from "@forge/api";

const getComments = async (issuekey) => {
  const commentsData = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issuekey}/comment`, {
      headers: {
        Accept: "application/json",
      },
    });
  const respondeData = await commentsData.json();
  const jsonData = await respondeData.comments;
  let extractedTexts = [];
  await jsonData.map((comment) => {
    if (comment.body && comment.body.content) {
      comment.body.content.map(contentItem=>{
        if(contentItem.type==="paragraph" && contentItem.content){
          contentItem.content.map(textItem=>{
            if(textItem.type==="text" && textItem.text){
              extractedTexts.push(textItem.text)
            }
          })
        }
      });
    }
  });
  return extractedTexts.join('')
};

const App = () => {
  const context = useProductContext();
  const issuekey = context;

  const [comments] = useState(async () => await getComments(issuekey));
  console.log(`comments: ${comments}`);

  const prompt = comments;
  const [summary] = useState(async () => await callOpenAI(prompt));
  console.log(`summary: ${summary}`);

  return (
    <Fragment>
      <Text>{summary}</Text>
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
