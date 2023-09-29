export const getContainer = (targetId: string) => {
  let container = null;
  try {
    if (!targetId) {
      throw new Error(
        `${process.env.R4X_CLIENT_NAME} can't mount component into target container: missing targetId`
      );
    }
    container = document.getElementById(targetId);
  } catch (e) {
    console.error(e);
  }

  if (!container) {
    throw new Error(
      `${process.env.R4X_CLIENT_NAME} can't mount component into target container: no DOM element with ID '${targetId}'`
    );
  }

  return container;
};
