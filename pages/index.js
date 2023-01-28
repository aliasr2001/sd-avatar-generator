import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  // Don't retry more than 20 times
  const maxRetries = 20;
  // Creating state property over there
  const [ input, setInput ] = useState('')

  const [ img, setImg ] = useState('')
  // Num of Retries
  const [ retry, setRetry ] = useState(0);
  // Number of Retry left
  const [ retryCount, setRetryCount ] = useState(maxRetries);
  // Add isGenerating state
  const [isGenerating, setIsGenerating] = useState(false);
  //Adding the Final Prompt state Here
  const [ finalPrompt, setFinalPrompt ] = useState('');
  //Creating Func for setInput
  const onChange = (event) => {
    setInput(event.target.value)
  }

  // Creating Func for Generate Button
  const generateAction = async () => {
    console.log('Generating...')

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    // Set loading has started
    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0){
      setRetryCount((prevState) => {
        if (prevState === 0){
          return 0;
        } else {
          return prevState -1
        }
      });

      setRetry(0);
    }

    const finalInput = input.replace(/ali/gi, "aliasr")

    // Creating Func for Fetching the Data from the API
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({finalInput})
    })

    const data = await response.json();

    //If model still loading, drop that retry time
    if(response.status === 503 ){
      // set the estimated_time property in state
      setRetry(data.estimated_time)
      console.log('Model is still loading :(')
      return;
    }

    //if another error, drop error 
    if(!response.ok){
      console.log(`Error: ${data.error}`);
      // Stop loading
      setIsGenerating(false);
      return;
    }

    // Set Final Prompt Here
    setFinalPrompt(input);
    // Remove content from Input box
    setInput('');
    setImg(data.Image);
    // Everything is all done -- stop loading!
    setIsGenerating(false);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
  
  // adding useEffect here
  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0){
        console.log(`Model is still loading after ${maxRetries} retries. Try request again in 5 minutes.`)
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000)

      await generateAction();
    };

    if (retry === 0){
      return;
    }

    runRetry();
  }, [retry]);
  
  
  return (
    // Rest of the code will go there
    <div className="root">
      <Head>
        <title>LookAtMe - Ai Avatar Genertor</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Wanna Turn Yourself into A Nerd &#x1F47E;!</h1>
          </div>
          <div className="header-subtitle">
            <h2>Type Here The Secret Ingrediants For Your Next Social Profile Pics!<br/>One More Thing: If You Want To Take Revenge With Me Use "aliasr" In Your Prompt &#x1F61C; </h2>
          </div>
          {/* Add prompt container here */}
          <div className="prompt-container">
            <input className="prompt-box" placeholder='Ex. Portrait of { Subject } in/as { Object }, Hyper-Realistic, Highly Detailed, 4K etc.' value={input} onChange={onChange} />
            {/* Add your prompt button in the prompt container */}
            <div className="prompt-buttons">
              <a className={isGenerating ? 'generate-button loading' : 'generate-button'} onClick={generateAction}>
                <div className="generate">
                  { isGenerating ? (
                    <span className='loader'></span>
                  ) : (
                    <p>Let It Rip! &#128640;</p>
                    )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {/* Add output container */}
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={finalPrompt} />
            {/* Set the Final Prompt Here */}
            <p>{finalPrompt}</p>
          </div>
        )}
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
