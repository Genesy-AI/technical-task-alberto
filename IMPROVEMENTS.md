Since i dont have more time for this, i will just write a short one for the BE part.

1) Split the code in different files. Now we have one single file with all the different endpoints and it gets messy. I would split it in different controllers and services files.
2) Observability: One thing super important for be system that need to scale and get very complex, is observability, so i would work on adding new metrics, traces, that can help understand if something is unhealty, or if there are errors, to catch them earlier.

