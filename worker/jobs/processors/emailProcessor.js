export const processEmail = async (payload) => {

    console.log();
    console.log("Email Processor Started");

    console.log(`To      : ${payload.to}`);
    console.log(`Subject : ${payload.subject}`);
    console.log(`Message : ${payload.message}`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("Email Sent Successfully");

};